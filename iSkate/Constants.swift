//
//  Constants.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/11/26.
//

import Foundation

struct Constants {
    static let trickListString = "Trick List"
    static let profileString = "Profile"
    static let settingsString = "Settings"
    
    static let trickListIconString = "skateboard"
    static let profileIconString = "person.crop.circle"
    static let settingsIconString = "gear"
    
    static let testTrick = Trick(id: 0, name: "Ollie", difficulty: "Beginner", category: "Pop", summary: "The foundational trick of skateboarding. The rider pops the tail of the board while sliding their front foot up to jump into the air with the board.", resources: ["https://www.skateboardhere.com/skateboard-ollie.html"], isCompleted: false)
    static let testVideoIds = ["JNmUK9fvrAs", "QkeOAcj8Y5k", "KJnZvKwgZaA"]
}
