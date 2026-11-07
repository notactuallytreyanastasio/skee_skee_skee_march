import Foundation
struct M: Decodable { let mood: Int }
while let t = readLine(strippingNewline: true) {
  let s = (try? JSONSerialization.jsonObject(with: Data(("[" + t + "]").utf8))) != nil ? "R" : "X"
  var d = "nil"
  if let m = try? JSONDecoder().decode(M.self, from: Data(("{\"mood\": " + t + "}").utf8)) { d = String(m.mood) }
  print(s, d)
}
