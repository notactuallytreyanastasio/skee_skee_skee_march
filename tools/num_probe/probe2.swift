import Foundation
for t in CommandLine.arguments.dropFirst() {
  let shown = t.count > 60 ? String(t.prefix(24)) + "...(\(t.count))" : t
  do { let a = try JSONSerialization.jsonObject(with: Data(("[" + t + "]").utf8)) as! [Any]
       let n = a[0] as! NSNumber
       print(shown, "->", String(describing: type(of: n)), String(cString: n.objCType), n)
  } catch { print(shown, "REFUSED", (error as NSError).userInfo[NSDebugDescriptionErrorKey] ?? "") }
}
