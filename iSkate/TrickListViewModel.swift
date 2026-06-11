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

@MainActor
let previewModelContainer: ModelContainer = {
    do {
        // Create an isolated in-memory configuration so it doesn't touch real user data
        let configuration = ModelConfiguration(isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: Trick.self, configurations: configuration)
        
        // Seed the in-memory context immediately with your JSON data
        let context = container.mainContext
        let sampleTricks = loadTricks()
        
        for trick in sampleTricks {
            context.insert(trick)
        }
        
        return container
    } catch {
        fatalError("Failed to create preview container: \(error.localizedDescription)")
    }
}()
