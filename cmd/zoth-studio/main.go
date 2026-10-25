// Zoth Studio v2 — Native Cross-Platform Desktop & CLI Binary (Linux, macOS, Windows)
// Supports standalone single-file self-extracting payload (__ZOTH_ZIP_PAYLOAD__)
// Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
package main

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"
	"time"
)

const Version = "2.1.0"
const ZipMarker = "__ZOTH_ZIP_PAYLOAD__"

func extractAppendedZipIfPresent() string {
	exe, err := os.Executable()
	if err != nil {
		return ""
	}
	f, err := os.Open(exe)
	if err != nil {
		return ""
	}
	defer f.Close()

	st, err := f.Stat()
	if err != nil || st.Size() < 10*1024*1024 {
		return ""
	}

	cfgDir, err := os.UserConfigDir()
	if err != nil {
		cfgDir = os.TempDir()
	}
	destRoot := filepath.Join(cfgDir, "ZothStudio", "v"+Version)
	if st2, err := os.Stat(filepath.Join(destRoot, "dist", "index.html")); err == nil && !st2.IsDir() {
		return destRoot
	}

	// Scan the first 12MB of the binary for ZipMarker
	scanLen := int64(12 * 1024 * 1024)
	if st.Size() < scanLen {
		scanLen = st.Size()
	}
	buf := make([]byte, scanLen)
	n, _ := f.ReadAt(buf, 0)
	idx := bytes.Index(buf[:n], []byte(ZipMarker))
	if idx < 0 {
		return ""
	}

	zipOffset := int64(idx + len(ZipMarker))
	zipSize := st.Size() - zipOffset
	section := io.NewSectionReader(f, zipOffset, zipSize)
	zr, err := zip.NewReader(section, zipSize)
	if err != nil {
		return ""
	}

	fmt.Printf("📦 First-run setup: extracting Zoth Studio v%s to %s...\n", Version, destRoot)
	_ = os.MkdirAll(destRoot, 0755)
	for _, zf := range zr.File {
		rel := zf.Name
		// Strip top-level folder if present
		if parts := strings.SplitN(rel, "/", 2); len(parts) == 2 && strings.HasPrefix(parts[0], "zoth-studio-") {
			rel = parts[1]
		}
		if rel == "" {
			continue
		}
		target := filepath.Join(destRoot, filepath.FromSlash(rel))
		if !strings.HasPrefix(filepath.Clean(target), filepath.Clean(destRoot)+string(os.PathSeparator)) {
			continue
		}
		if zf.FileInfo().IsDir() {
			_ = os.MkdirAll(target, 0755)
			continue
		}
		_ = os.MkdirAll(filepath.Dir(target), 0755)
		rc, err := zf.Open()
		if err != nil {
			continue
		}
		out, err := os.OpenFile(target, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, zf.Mode())
		if err == nil {
			_, _ = io.Copy(out, rc)
			_ = out.Close()
		}
		_ = rc.Close()
	}
	return destRoot
}

func resolveAppRoot() string {
	if extracted := extractAppendedZipIfPresent(); extracted != "" {
		return extracted
	}
	exe, err := os.Executable()
	if err == nil {
		exeDir := filepath.Dir(exe)
		candidates := []string{
			exeDir,
			filepath.Join(exeDir, "..", "Resources", "app"),
			filepath.Join(exeDir, "..", "lib", "zoth-studio"),
			"/usr/lib/zoth-studio",
			"/opt/zoth-studio",
		}
		for _, c := range candidates {
			if st, err := os.Stat(filepath.Join(c, "dist", "index.html")); err == nil && !st.IsDir() {
				abs, _ := filepath.Abs(c)
				return abs
			}
			if st, err := os.Stat(filepath.Join(c, "index.html")); err == nil && !st.IsDir() {
				abs, _ := filepath.Abs(c)
				return abs
			}
		}
	}
	cwd, _ := os.Getwd()
	return cwd
}

func resolveDistDir(root string) string {
	d := filepath.Join(root, "dist")
	if st, err := os.Stat(filepath.Join(d, "index.html")); err == nil && !st.IsDir() {
		return d
	}
	p := filepath.Join(root, "public")
	if st, err := os.Stat(filepath.Join(p, "index.html")); err == nil && !st.IsDir() {
		return p
	}
	return root
}

func findFreePort(preferred int) int {
	ports := []int{preferred, 3000, 8088, 8080, 8484, 3001, 3002}
	for _, p := range ports {
		ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", p))
		if err == nil {
			_ = ln.Close()
			return p
		}
	}
	return preferred
}

func isPortListening(port int) bool {
	conn, err := net.DialTimeout("tcp", fmt.Sprintf("127.0.0.1:%d", port), 350*time.Millisecond)
	if err == nil {
		_ = conn.Close()
		return true
	}
	return false
}

func openAppWindow(url string, root string) {
	switch runtime.GOOS {
	case "windows":
		browsers := []string{"msedge", "chrome"}
		for _, b := range browsers {
			if path, err := exec.LookPath(b); err == nil {
				_ = exec.Command(path, "--app="+url).Start()
				return
			}
		}
		_ = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		chromeApp := "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
		if _, err := os.Stat(chromeApp); err == nil {
			_ = exec.Command(chromeApp, "--app="+url).Start()
			return
		}
		_ = exec.Command("open", url).Start()
	default:
		for _, el := range []string{"/usr/local/bin/electron", "/opt/electron/electron"} {
			if _, err := os.Stat(el); err == nil {
				if _, err2 := os.Stat(filepath.Join(root, "main.cjs")); err2 == nil {
					cmd := exec.Command(el, root)
					cmd.Env = append(os.Environ(), fmt.Sprintf("PORT=%s", strings.TrimPrefix(strings.Split(url, ":")[2], "")))
					_ = cmd.Start()
					return
				}
			}
		}
		for _, b := range []string{"google-chrome-stable", "google-chrome", "chromium", "chromium-browser"} {
			if path, err := exec.LookPath(b); err == nil {
				_ = exec.Command(path, "--no-sandbox", "--app="+url).Start()
				return
			}
		}
		_ = exec.Command("xdg-open", url).Start()
	}
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func startNativeServer(port int, distDir string) (*http.Server, error) {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/studio/host", func(w http.ResponseWriter, r *http.Request) {
		host, _ := os.Hostname()
		writeJSON(w, 200, map[string]any{
			"isZothOS":  runtime.GOOS == "linux",
			"distro":    fmt.Sprintf("Zoth Studio Native (%s/%s)", runtime.GOOS, runtime.GOARCH),
			"release":   "v" + Version + " (Sovereign Cross-Platform Edition)",
			"kernel":    runtime.Version(),
			"arch":      runtime.GOARCH,
			"hostname":  host,
			"cpus":      runtime.NumCPU(),
			"cpuModel":  fmt.Sprintf("%s %s (%d cores)", runtime.GOOS, runtime.GOARCH, runtime.NumCPU()),
			"totalMem":  16384,
			"freeMem":   8192,
			"uptime":    3600,
			"installedTools": map[string]bool{
				"ollama": isPortListening(11434),
			},
		})
	})

	mux.HandleFunc("/api/studio/reality", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, map[string]any{
			"mode":     "gold",
			"allModes": []string{"gold", "ghost", "matrix", "incognito"},
		})
	})

	mux.HandleFunc("/api/studio/status", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, map[string]any{
			"checkedAt": time.Now().UTC().Format(time.RFC3339),
			"kvm":       runtime.GOOS == "linux",
			"services": map[string]any{
				"swarm":        map[string]any{"name": "Swarm multiplexer", "port": 8989, "up": isPortListening(8989) || isPortListening(8790)},
				"memory":       map[string]any{"name": "Neuro memory daemon", "port": 8094, "up": isPortListening(8094)},
				"bridge":       map[string]any{"name": "Sovereign agent bridge", "port": 8102, "up": isPortListening(8102)},
				"vault":        map[string]any{"name": "Vault daemon", "port": 8787, "up": isPortListening(8787)},
				"ollama":       map[string]any{"name": "Ollama", "port": 11434, "up": isPortListening(11434), "models": []string{}},
				"webgen":       map[string]any{"name": "Zoth WebGen Foundry", "port": 8092, "up": isPortListening(8092)},
				"civilization": map[string]any{"name": "Zoth civilization", "port": 9393, "up": isPortListening(9393)},
			},
		})
	})

	mux.HandleFunc("/api/swarm/status", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, map[string]any{
			"up":      true,
			"port":    port,
			"version": Version,
			"agents":  21,
			"status":  "ONLINE",
		})
	})

	mux.HandleFunc("/api/studio/swarm/status", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, map[string]any{
			"up":      true,
			"port":    port,
			"version": Version,
			"agents":  21,
			"status":  "ONLINE",
		})
	})

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		cleanPath := filepath.Clean(strings.TrimPrefix(r.URL.Path, "/"))
		if cleanPath == "." || cleanPath == "" {
			cleanPath = "index.html"
		}
		candidates := []string{
			filepath.Join(distDir, cleanPath),
			filepath.Join(distDir, cleanPath, "index.html"),
			filepath.Join(distDir, cleanPath+".html"),
		}
		for _, f := range candidates {
			if st, err := os.Stat(f); err == nil && !st.IsDir() {
				http.ServeFile(w, r, f)
				return
			}
		}
		indexFile := filepath.Join(distDir, "index.html")
		if _, err := os.Stat(indexFile); err == nil {
			http.ServeFile(w, r, indexFile)
			return
		}
		http.NotFound(w, r)
	})

	srv := &http.Server{
		Addr:    fmt.Sprintf("127.0.0.1:%d", port),
		Handler: mux,
	}
	go func() {
		_ = srv.ListenAndServe()
	}()
	return srv, nil
}

func main() {
	var (
		portFlag     = flag.Int("port", 3000, "Loopback port for Zoth Studio")
		headlessFlag = flag.Bool("headless", false, "Run server without launching browser/GUI window")
		versionFlag  = flag.Bool("version", false, "Print version and exit")
		vShortFlag   = flag.Bool("v", false, "Print version and exit")
	)
	flag.Parse()

	if *versionFlag || *vShortFlag || (flag.NArg() > 0 && flag.Arg(0) == "version") {
		fmt.Printf("Zoth Studio v%s (%s/%s) — Sovereign AI Agent Workstation\n", Version, runtime.GOOS, runtime.GOARCH)
		return
	}

	root := resolveAppRoot()
	distDir := resolveDistDir(root)

	if flag.NArg() > 0 && (flag.Arg(0) == "doctor" || flag.Arg(0) == "status") {
		fmt.Printf("⚡ Zoth Studio v%s (%s/%s)\n", Version, runtime.GOOS, runtime.GOARCH)
		fmt.Printf("  App Root : %s\n", root)
		fmt.Printf("  Dist Dir : %s\n", distDir)
		fmt.Printf("  Ollama   : %v (127.0.0.1:11434)\n", isPortListening(11434))
		fmt.Printf("  Bridge   : %v (127.0.0.1:8102)\n", isPortListening(8102))
		fmt.Printf("  Memory   : %v (127.0.0.1:8094)\n", isPortListening(8094))
		fmt.Printf("  WebGen   : %v (127.0.0.1:8092)\n", isPortListening(8092))
		return
	}

	port := *portFlag
	if !isPortListening(port) {
		port = findFreePort(port)
	}
	url := fmt.Sprintf("http://127.0.0.1:%d/", port)

	fmt.Printf("⚡ Starting Zoth Studio v%s (%s/%s)...\n", Version, runtime.GOOS, runtime.GOARCH)

	var nodeCmd *exec.Cmd
	serveMjs := filepath.Join(root, "server", "serve.mjs")
	zothCli := filepath.Join(root, "bin", "zoth.js")
	if nodePath, err := exec.LookPath("node"); err == nil {
		if _, err := os.Stat(zothCli); err == nil {
			bg := exec.Command(nodePath, zothCli, "up")
			bg.Dir = root
			bg.Stdout = io.Discard
			bg.Stderr = io.Discard
			_ = bg.Start()
		}
		if !isPortListening(port) {
			if _, err := os.Stat(serveMjs); err == nil {
				nodeCmd = exec.Command(nodePath, serveMjs, "--port", fmt.Sprintf("%d", port), "--dir", distDir)
				nodeCmd.Dir = root
				nodeCmd.Stdout = os.Stdout
				nodeCmd.Stderr = os.Stderr
				_ = nodeCmd.Start()
				time.Sleep(500 * time.Millisecond)
			}
		}
	}

	if !isPortListening(port) {
		_, _ = startNativeServer(port, distDir)
		time.Sleep(250 * time.Millisecond)
	}

	fmt.Printf("🌐 Zoth Studio v%s is LIVE at %s\n", Version, url)

	if !*headlessFlag {
		openAppWindow(url, root)
	}

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	<-sigCh
	fmt.Println("\n🛑 Shutting down Zoth Studio...")
	if nodeCmd != nil && nodeCmd.Process != nil {
		_ = nodeCmd.Process.Kill()
	}
}
