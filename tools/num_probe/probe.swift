import Foundation
struct M: Decodable { let mood: Int }
func ser(_ t: String) -> String { (try? JSONSerialization.jsonObject(with: Data(("[" + t + "]").utf8))) != nil ? "read" : "REFUSED" }
func dec(_ t: String) -> String { if let m = try? JSONDecoder().decode(M.self, from: Data(("{\"mood\": " + t + "}").utf8)) { return "Int \(m.mood)" } else { return "nil" } }
let args = CommandLine.arguments.dropFirst()
for t in args { print(t.count > 60 ? String(t.prefix(30)) + "...(\(t.count))" : t, ser(t), dec(t)) }
