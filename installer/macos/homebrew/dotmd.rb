cask "dotmd" do
  arch arm: "aarch64", intel: "x64"

  version "1.0.0"
  sha256 :no_check

  url "https://github.com/dotmd/dot-md/releases/download/v#{version}/dot-md_#{version}_#{arch}.dmg"
  name "dot md"
  desc "Publication-grade Markdown editor and viewer with instant live reload"
  homepage "https://github.com/dotmd/dot-md"

  livecheck do
    url :url
    strategy :github_latest
  end

  auto_updates true
  depends_on macos: ">= :high_sierra"

  app "dot md.app"
  binary "#{appdir}/dot md.app/Contents/MacOS/dot-md", target: "dotmd"

  zap trash: [
    "~/Library/Application Support/dot-md",
    "~/Library/Caches/dot-md",
    "~/Library/Preferences/com.dotmd.app.plist",
    "~/Library/Saved Application State/com.dotmd.app.savedState",
  ]
end
