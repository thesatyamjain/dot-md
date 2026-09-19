using System;
using System.Diagnostics;
using System.IO;

namespace DotMd
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string exeDir = AppDomain.CurrentDomain.BaseDirectory;
                string cliPath = Path.Combine(exeDir, "cli.js");
                if (!File.Exists(cliPath))
                {
                    cliPath = Path.Combine(exeDir, "bin", "cli.js");
                }
                if (!File.Exists(cliPath))
                {
                    cliPath = Path.Combine(exeDir, "..", "bin", "cli.js");
                }
                cliPath = Path.GetFullPath(cliPath);

                if (!File.Exists(cliPath))
                {
                    return;
                }

                string nodeExe = "node.exe";
                string[] commonPaths = new string[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "nodejs", "node.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "nodejs", "node.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "node", "node.exe")
                };

                foreach (string p in commonPaths)
                {
                    if (File.Exists(p))
                    {
                        nodeExe = p;
                        break;
                    }
                }

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = nodeExe;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                psi.WorkingDirectory = Environment.CurrentDirectory;

                string cmdArgs = "\"" + cliPath + "\"";
                foreach (string arg in args)
                {
                    cmdArgs += " \"" + arg.Replace("\"", "\\\"") + "\"";
                }
                psi.Arguments = cmdArgs;

                Process.Start(psi);
            }
            catch
            {
            }
        }
    }
}
