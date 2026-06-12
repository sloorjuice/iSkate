//
//  TrickListViewModel.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import Foundation
import SwiftData

func loadTricks() -> [Trick] {
    guard let url = Bundle.main.url(forResource: "tricks", withExtension: "json") else {
        print("Failed to locate tricks.json in bundle.")
        return[]
    }
    
    do {
        let data = try Data(contentsOf: url)
        let decoder = JSONDecoder()
        return try decoder.decode([Trick].self, from:data)
    } catch {
        print("Error decoding JSON: \(error)")
        return []
    }
}

extension ModelContainer {
    @MainActor
    static var previewContainer: ModelContainer = {
        let schema = Schema([Trick.self])
        // Keep it strictly in-memory so it's fast and clears out every time the canvas reloads
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        
        do {
            let container = try ModelContainer(for: schema, configurations: [configuration])
            let context = container.mainContext
            
            // Fetch your array of tricks using your existing bundle loader
            let sampleTricks = loadTricks()
            
            // Insert them directly into the context immediately
            for trick in sampleTricks {
                context.insert(trick)
            }
            
            // Save the context right away so the preview has immediate access
            try? context.save()
            return container
        } catch {
            fatalError("Failed to create preview container: \(error)")
        }
    }()
}
