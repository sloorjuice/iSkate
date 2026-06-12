//
//  YouTubePlayerView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/12/26.
//

import SwiftUI
import WebKit

struct YouTubePlayerView: UIViewRepresentable {
    let videoId: String
    
    func makeUIView(context: Context) -> WKWebView {
        let webConfiguration = WKWebViewConfiguration()
        // Allows the web view video to play right inside your UI stacks instead of jumping to native fullscreen
        webConfiguration.allowsInlineMediaPlayback = true
        webConfiguration.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.scrollView.isScrollEnabled = false // Prevents inner-boundary scrolling jitter
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        guard let url = URL(string: "https://www.youtube.com/embed/\(videoId)?playsinline=1") else { return }
        
        // 1. Change 'let' to 'var' to allow modifications
        var request = URLRequest(url: url)
        
        // 2. Inject the Referer header here as well
        request.setValue("https://your-authorized-domain.com", forHTTPHeaderField: "Referer")
        
        // 3. Load the modified request
        uiView.load(request)
    }
}

#Preview {
    YouTubePlayerView(videoId: "CY7cvgVomAE?si")
}
