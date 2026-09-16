using System;
using System.IO;
using System.Windows.Forms;
using Microsoft.Win32;

namespace DotMdInstaller
{
    static class Program
    {
        [STAThread]
        static int Main(string[] args)
        {
            bool isSilent = false;
            bool isUninstall = false;

            foreach (string arg in args)
            {
                if (arg.Equals("/silent", StringComparison.OrdinalIgnoreCase) || arg.Equals("/s", StringComparison.OrdinalIgnoreCase))
                    isSilent = true;
                if (arg.Equals("/uninstall", StringComparison.OrdinalIgnoreCase) || arg.Equals("/u", StringComparison.OrdinalIgnoreCase))
                    isUninstall = true;
            }

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string rootDir = Path.GetFullPath(Path.Combine(baseDir, ".."));
            string cliPath = Path.Combine(rootDir, "bin", "cli.js");
            string iconPath = Path.Combine(rootDir, "favicon.ico");

            if (isUninstall)
            {
                return PerformUninstall(isSilent);
            }

            if (!isSilent)
            {
                DialogResult dr = MessageBox.Show(
                    "Welcome to dot md Setup!\n\n" +
                    "This will register dot md as your default Markdown viewer and add 'Open with dot md' to your right-click context menu.\n\n" +
                    "Would you like to proceed with the installation?",
                    "dot md - Setup",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information);

                if (dr != DialogResult.Yes) return 1;
            }

            try
            {
                string command = "\"node.exe\" \"" + cliPath + "\" \"%1\"";

                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\.md"))
                {
                    key.SetValue("", "dotmd.document");
                }
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\.markdown"))
                {
                    key.SetValue("", "dotmd.document");
                }
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\dotmd.document"))
                {
                    key.SetValue("", "Markdown Document");
                }

                if (File.Exists(iconPath))
                {
                    using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\dotmd.document\DefaultIcon"))
                    {
                        key.SetValue("", iconPath);
                    }
                }

                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\dotmd.document\shell\open\command"))
                {
                    key.SetValue("", command);
                }

                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\*\shell\OpenWithDotMd"))
                {
                    key.SetValue("", "Open with dot md");
                    if (File.Exists(iconPath))
                    {
                        key.SetValue("Icon", iconPath);
                    }
                }
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\*\shell\OpenWithDotMd\command"))
                {
                    key.SetValue("", command);
                }

                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\dotmd"))
                {
                    key.SetValue("DisplayName", "dot md - Markdown Editor & Viewer");
                    key.SetValue("DisplayVersion", "1.0.0");
                    key.SetValue("Publisher", "dot md team");
                    if (File.Exists(iconPath)) key.SetValue("DisplayIcon", iconPath);
                    key.SetValue("UninstallString", "\"" + Path.Combine(baseDir, "dotmd-setup.exe") + "\" /uninstall");
                }

                if (!isSilent)
                {
                    MessageBox.Show(
                        "dot md has been successfully installed!\n\n" +
                        "✔ File associations registered for .md and .markdown\n" +
                        "✔ Right-click context menu 'Open with dot md' added\n\n" +
                        "You can now double-click any markdown file to view it with dot md.",
                        "dot md - Installation Complete",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Information);
                }

                return 0;
            }
            catch (Exception ex)
            {
                if (!isSilent)
                {
                    MessageBox.Show("Installation failed:\n" + ex.Message, "dot md - Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                return 1;
            }
        }

        static int PerformUninstall(bool isSilent)
        {
            try
            {
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Classes\.md", false);
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Classes\.markdown", false);
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Classes\dotmd.document", false);
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Classes\*\shell\OpenWithDotMd", false);
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\dotmd", false);

                if (!isSilent)
                {
                    MessageBox.Show(
                        "dot md has been successfully uninstalled from your system.",
                        "dot md - Uninstallation Complete",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Information);
                }
                return 0;
            }
            catch (Exception ex)
            {
                if (!isSilent)
                {
                    MessageBox.Show("Uninstallation failed:\n" + ex.Message, "dot md - Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                return 1;
            }
        }
    }
}
