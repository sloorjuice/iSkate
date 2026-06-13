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
        return []
    }
    
    do {
        let data = try Data(contentsOf: url)
        let decoder = JSONDecoder()
        return try decoder.decode([Trick].self, from: data)
    } catch {
        print("Error decoding JSON: \(error)")
        return []
    }
}

extension ModelContainer {
    @MainActor
    static var previewContainer: ModelContainer = {
        let schema = Schema([TrickProgress.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        
        do {
            let container = try ModelContainer(for: schema, configurations: [configuration])
            let context = container.mainContext
            
            // OPTIONAL SEEDING FOR PREVIEWS:
            // Since previews only track progress, we can seed a dummy completed state
            // for the first trick (ID 0) just to make sure the preview canvas looks right.
            let sampleProgress = TrickProgress(id: 0, isCompleted: true)
            context.insert(sampleProgress)
            
            try? context.save()
            return container
        } catch {
            fatalError("Failed to create preview container: \(error)")
        }
    }()
}
