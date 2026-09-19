// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use notify::{Event, RecursiveMode, Watcher};
use pulldown_cmark::{html, Options, Parser};
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DocumentPayload {
    pub filename: String,
    pub file_path: String,
    pub markdown: String,
}

#[derive(Default)]
pub struct AppState {
    pub active_file: Mutex<Option<PathBuf>>,
    pub is_internal_saving: Arc<AtomicBool>,
}

#[tauri::command]
fn get_initial_document(state: State<'_, AppState>) -> Result<DocumentPayload, String> {
    let file_opt = state.active_file.lock().map_err(|e| e.to_string())?.clone();
    let target_path = match file_opt {
        Some(p) => {
            let path_str = p.to_string_lossy().to_string();
            let clean = path_str.trim_matches('"').trim_matches('\'').to_string();
            PathBuf::from(clean)
        }
        None => {
            if Path::new("sample.md").exists() {
                PathBuf::from("sample.md")
            } else if Path::new("README.md").exists() {
                PathBuf::from("README.md")
            } else {
                return Ok(DocumentPayload {
                    filename: "Welcome.md".into(),
                    file_path: "".into(),
                    markdown: "# Welcome to dot md\n\nPublication-grade Markdown editor and standalone viewer.\n\n### Getting Started\n- Press **Ctrl+E** to edit this document in-place\n- Press **Ctrl+S** to save to disk\n- Press **T** to cycle themes (Dark / Light / Sepia)\n- Press **Z** for Zen reading mode\n- Press **W** to toggle Wide view\n".into(),
                });
            }
        }
    };

    let filename = target_path
        .file_name()
        .map(|f| f.to_string_lossy().to_string())
        .unwrap_or_else(|| "document.md".into());
    let file_path = target_path.to_string_lossy().to_string();

    let markdown = fs::read_to_string(&target_path)
        .or_else(|_| {
            let canonical = target_path.canonicalize().unwrap_or(target_path.clone());
            fs::read_to_string(&canonical)
        })
        .unwrap_or_else(|e| {
            format!("# {}\n\n*Unable to read file contents: {}*", filename, e)
        });

    Ok(DocumentPayload {
        filename,
        file_path,
        markdown,
    })
}

#[tauri::command]
fn save_document(
    state: State<'_, AppState>,
    file_path: String,
    markdown: String,
) -> Result<bool, String> {
    state.is_internal_saving.store(true, Ordering::SeqCst);
    let path = PathBuf::from(&file_path);

    let write_res = fs::write(&path, markdown).map_err(|e| e.to_string());

    // Reset internal save suppression after a short debounce
    let flag = Arc::clone(&state.is_internal_saving);
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_millis(350));
        flag.store(false, Ordering::SeqCst);
    });

    write_res.map(|_| true)
}

#[tauri::command]
fn parse_markdown_native(markdown: String) -> String {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);

    let parser = Parser::new_ext(&markdown, options);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    html_output
}

fn setup_file_watcher(app_handle: AppHandle, target_file: PathBuf, internal_flag: Arc<AtomicBool>) {
    let parent_dir = match target_file.parent() {
        Some(p) => p.to_path_buf(),
        None => return,
    };

    std::thread::spawn(move || {
        let (tx, rx) = std::sync::mpsc::channel();
        let mut watcher = match notify::recommended_watcher(move |res: notify::Result<Event>| {
            if let Ok(event) = res {
                let _ = tx.send(event);
            }
        }) {
            Ok(w) => w,
            Err(_) => return,
        };

        if watcher
            .watch(&parent_dir, RecursiveMode::NonRecursive)
            .is_err()
        {
            return;
        }

        while let Ok(event) = rx.recv() {
            if internal_flag.load(Ordering::SeqCst) {
                continue;
            }

            if event.paths.iter().any(|p| p == &target_file) {
                std::thread::sleep(Duration::from_millis(50));
                if let Ok(updated_md) = fs::read_to_string(&target_file) {
                    let filename = target_file
                        .file_name()
                        .map(|f| f.to_string_lossy().to_string())
                        .unwrap_or_else(|| "document.md".into());

                    let payload = DocumentPayload {
                        filename,
                        file_path: target_file.to_string_lossy().to_string(),
                        markdown: updated_md,
                    };

                    let _ = app_handle.emit("md-file-updated", payload);
                }
            }
        }
    });
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let mut target_file: Option<PathBuf> = None;

    if args.len() > 1 {
        for arg in args.iter().skip(1) {
            let clean = arg.trim_matches('"').trim_matches('\'');
            if !clean.starts_with('-') && Path::new(clean).exists() {
                target_file = Some(PathBuf::from(clean));
                break;
            }
        }
        if target_file.is_none() {
            let joined: String = args.iter().skip(1).filter(|a| !a.starts_with('-')).cloned().collect::<Vec<_>>().join(" ");
            let clean_joined = joined.trim_matches('"').trim_matches('\'');
            if !clean_joined.is_empty() && Path::new(clean_joined).exists() {
                target_file = Some(PathBuf::from(clean_joined));
            } else if let Some(first) = args.iter().skip(1).find(|a| !a.starts_with('-')) {
                let clean_first = first.trim_matches('"').trim_matches('\'');
                target_file = Some(PathBuf::from(clean_first));
            }
        }
    }

    let file_path_buf = target_file;

    let app_state = AppState {
        active_file: Mutex::new(file_path_buf.clone()),
        is_internal_saving: Arc::new(AtomicBool::new(false)),
    };

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_initial_document,
            save_document,
            parse_markdown_native
        ])
        .setup(move |app| {
            if let Some(target_file) = file_path_buf {
                let canonical = target_file.canonicalize().unwrap_or(target_file);
                let state = app.state::<AppState>();
                let flag = Arc::clone(&state.is_internal_saving);
                setup_file_watcher(app.handle().clone(), canonical, flag);
            }
            Ok(())
        });

    builder
        .run(tauri::generate_context!())
        .expect("error while running dot md tauri application");
}
