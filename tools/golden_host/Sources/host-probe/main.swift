import Foundation
@testable import SkeeCore
@testable import SkeeNet

func p(_ s: String) {
    let r = DeepSeek.parse(s)
    print(r.map { "OK say=\($0.say) n=\($0.offer.nights) t=\($0.offer.tickets) c=\($0.offer.credit) mood=\($0.mood) walk=\($0.walk) off=\(String(describing: $0.offTopic))" } ?? "nil", "<=", s.debugDescription)
}
let base = #"{"say": "Hi", "offer": {"nights": NN, "tickets": 0, "credit": 0}, "mood": 0, "walk": false}"#
for n in ["1", "1.0", "1.5", "1e0", "1E2", "-0", "01", "1.", "-1", "9007199254740993", "9223372036854775807", "9223372036854775808", "1e18", "1e19", "\"1\"", "true", "null", "1e-400", "0.0", "2.000000000000000001"] {
    p(base.replacingOccurrences(of: "NN", with: n))
}
p(#"{"say": "Hi", "offer": {"nights": 1, "tickets": 0, "credit": 0}, "mood": 0, "walk": false, "offTopic": null}"#)
p(#"{"say": "Hi", "offer": {"nights": 1, "tickets": 0, "credit": 0}, "mood": 0, "walk": false, "offTopic": 1}"#)
p(#"{"say": "Hi", "offer": {"nights": 1, "tickets": 0, "credit": 0}, "mood": 0, "walk": 0}"#)
p(#"{"say": "Hi", "offer": {"nights": 1, "tickets": 0, "credit": 0}, "mood": 0}"#)
p(#"{"say": "Hi", "offer": {"nights": 1, "tickets": 0, "credit": 0, "x": "\u0001"}, "mood": 0, "walk": false}"#)
p("{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"\\\" \ntickets\": 0, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}")
p("{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"\\\" \ntickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}")
p("{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false, \"\\\" \nx\": 1}")
p(#"{"say": "Hi", "say": "Bye", "offer": {"nights": 1, "tickets": 0, "credit": 0}, "mood": 0, "walk": false}"#)
p(#"{"say": "", "offer": {"nights": 1, "tickets": 0, "credit": 0}, "mood": 0, "walk": false}"#)
p("```json\r\n{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}\r\n```")
p("\u{1FEF}``json\n{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}\n```")
p("\u{A0}\u{2028}{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}\u{3000}")
p("\u{200B}{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}")
p("{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0,}, \"mood\": 0, \"walk\": false,}")
p("{\"say\": \"H\\ud800i\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}")
p("{\"say\": \"Hi\\u0000\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}")
p("{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false} trailing")
p("[{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}]")
