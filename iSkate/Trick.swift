//
//  Trick.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import Foundation

struct Trick: Decodable, Identifiable, Hashable {
    var id: Int
    var name: String
    var difficulty: String
    var category: String
    var summary: String
    var resources: [String]?
    var tips: [String]?
    
    // UI-only computed states that we will attach during runtime
    var isCompleted: Bool = false
    var cachedVideoIds: [String]? = nil
    var lastUpdated: Date? = nil

    enum CodingKeys: String, CodingKey {
        case id, name, difficulty, category, summary, resources, tips
    }
}
