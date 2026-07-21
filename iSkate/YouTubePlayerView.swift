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
        
        if uiView.url?.absoluteString == url.absoluteString {
            return
        }
        
        var request = URLRequest(url: url)
        request.setValue("https://your-authorized-domain.com", forHTTPHeaderField: "Referer")
        uiView.load(request)
    }
}

#Preview {
    YouTubePlayerView(videoId: "CY7cvgVomAE?si")
}
