//
//  SupabaseManager.swift
//  iSkate
//
//  Created by Anthony Reynolds on 7/8/26.
//

import Foundation
import Supabase

enum SupabaseManager {
    static let client = SupabaseClient(
        supabaseURL: URL(string: "https://fgrydntxerikzsfjfsoa.supabase.co")!,
        supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncnlkbnR4ZXJpa3pzZmpmc29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MzQzMTYsImV4cCI6MjA5OTExMDMxNn0.kuFQiS_KEilEGOVbjfG28JbEcPz-teq5SJ-lUFaa1qc",
        options: SupabaseClientOptions(
            auth: .init(emitLocalSessionAsInitialSession: true)
        )
    )
}
