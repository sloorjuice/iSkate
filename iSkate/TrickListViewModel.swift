//
//  TrickListViewModel.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import Foundation

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
