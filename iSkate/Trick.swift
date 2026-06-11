//
//  Trick.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import SwiftData

@Model
class Trick: Decodable, Identifiable, Hashable {
    // 1. Change type from String to Int
    @Attribute(.unique) var id: Int
    var name: String
    var difficulty: String
    var category: String
    var summary: String
    var isCompleted: Bool
    
    // 2. Update type here to Int
    init(id: Int, name: String, difficulty: String, category: String, summary: String, isCompleted: Bool) {
        self.id = id
        self.name = name
        self.difficulty = difficulty
        self.category = category
        self.summary = summary
        self.isCompleted = isCompleted
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case difficulty
        case category
        case summary
        case isCompleted
    }
    
    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        // 3. Decode as an Int instead of a String
        id = try container.decodeIfPresent(Int.self, forKey: .id) ?? 0
        name = try container.decodeIfPresent(String.self, forKey: .name) ?? ""
        difficulty = try container.decodeIfPresent(String.self, forKey: .difficulty) ?? ""
        category = try container.decodeIfPresent(String.self, forKey: .category) ?? ""
        summary = try container.decodeIfPresent(String.self, forKey: .summary) ?? ""
        isCompleted = try container.decodeIfPresent(Bool.self, forKey: .isCompleted) ?? false
    }
}
