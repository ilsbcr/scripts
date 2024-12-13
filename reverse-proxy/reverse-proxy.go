package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

// ReverseProxyHandler sets up the reverse proxy
func ReverseProxyHandler(target string) http.Handler {
	// Parse the target URL
	url, err := url.Parse(target)
	if err != nil {
		log.Fatalf("Failed to parse target URL: %v", err)
	}

	// Create a reverse proxy
	proxy := httputil.NewSingleHostReverseProxy(url)

	// Modify the request if needed (optional)
	proxy.ModifyResponse = func(resp *http.Response) error {
		// Modify response headers or body here if needed
		return nil
	}

	// Set up a handler function
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Update request headers or other properties before forwarding
		r.Header.Set("X-Proxy-By", "Go Reverse Proxy")
		proxy.ServeHTTP(w, r)
	})
}

func main() {
	// Define the target backend service
	target := "http://localhost:4900" // Replace with your backend URL

	// Set up the reverse proxy handler
	proxyHandler := ReverseProxyHandler(target)

	// Start the HTTP server
	port := "5000" // Port where the proxy server will run
	log.Printf("Starting reverse proxy on port %s, forwarding to %s", port, target)
	if err := http.ListenAndServe(":"+port, proxyHandler); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
