import { march_float_round, march_float_to_string, march_int_and, march_int_div, march_int_div_euclid, march_int_div_floor, march_int_mod, march_int_mod_euclid, march_int_mod_floor, march_int_not, march_int_or, march_int_ovf, march_int_popcount, march_int_shl, march_int_shr, march_int_wrapping_add, march_int_wrapping_mul, march_int_wrapping_sub, march_int_xor, march_string_byte_length, march_string_ends_with, march_string_to_float, march_unix_time, march_unix_time_ms } from "./march_runtime.mjs";

import { synth_cell_put, synth_cell_get } from "./skee_synth_cell.mjs";
import { worklet_register } from "./skee_worklet.mjs";


const int_to_string   = { _0: ($_, x) => String(x) };
const bool_to_string  = { _0: ($_, x) => String(x) };
const int_to_float    = { _0: ($_, x) => x };
const float_to_int    = { _0: ($_, x) => Math.trunc(x) };
const float_truncate  = { _0: ($_, x) => Math.trunc(x) };
const string_is_empty = { _0: ($_, x) => x === "" };
const not_bool        = { _0: ($_, x) => !x };
const negate_int      = { _0: ($_, x) => march_int_ovf(-x, 3) };
const negate_float    = { _0: ($_, x) => -x };
const float_abs       = { _0: ($_, x) => Math.abs(x) };
const float_floor     = { _0: ($_, x) => Math.floor(x) };
const float_ceil      = { _0: ($_, x) => Math.ceil(x) };
const float_to_string    = { _0: ($_, x) => march_float_to_string(x) };
const string_length      = { _0: ($_, x) => march_string_byte_length(x) };
const string_byte_length = { _0: ($_, x) => march_string_byte_length(x) };
const int_and = { _0: ($_, a, b) => march_int_and(a, b) };
const int_or = { _0: ($_, a, b) => march_int_or(a, b) };
const int_xor = { _0: ($_, a, b) => march_int_xor(a, b) };
const int_shl = { _0: ($_, a, b) => march_int_shl(a, b) };
const int_shr = { _0: ($_, a, b) => march_int_shr(a, b) };
const int_mod = { _0: ($_, a, b) => march_int_mod(a, b) };
const int_div = { _0: ($_, a, b) => march_int_div(a, b) };
const int_mod_euclid = { _0: ($_, a, b) => march_int_mod_euclid(a, b) };
const int_div_euclid = { _0: ($_, a, b) => march_int_div_euclid(a, b) };
const int_mod_floor = { _0: ($_, a, b) => march_int_mod_floor(a, b) };
const int_div_floor = { _0: ($_, a, b) => march_int_div_floor(a, b) };
const int_wrapping_add = { _0: ($_, a, b) => march_int_wrapping_add(a, b) };
const int_wrapping_sub = { _0: ($_, a, b) => march_int_wrapping_sub(a, b) };
const int_wrapping_mul = { _0: ($_, a, b) => march_int_wrapping_mul(a, b) };
const int_not = { _0: ($_, a) => march_int_not(a) };
const int_popcount = { _0: ($_, a) => march_int_popcount(a) };
const int_abs     = { _0: ($_, a) => Math.abs(a) };
const unix_time   = { _0: ($_) => march_unix_time() };
const unix_time_ms = { _0: ($_) => march_unix_time_ms() };
const float_round = { _0: ($_, a) => march_float_round(a) };
const synth_cell_get$clo = { _0: ($_, ) => synth_cell_get() };
const synth_cell_put$clo = { _0: ($_, p0) => synth_cell_put(p0) };
const worklet_register$clo = { _0: ($_, p0, p1) => worklet_register(p0, p1) };

function __eq_Option(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "None": {
      return true;
    }
    case "Some": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Result(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Ok": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Err": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_List(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Nil": {
      return true;
    }
    case "Cons": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Hamt$HEntry(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HEmpty": {
      return true;
    }
    case "HLeaf": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "HBranch": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "HCollision": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Map$Map(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HamtMap": {
      if (!__eq_HEntry(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Map$HEntry(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HEmpty": {
      return true;
    }
    case "HLeaf": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "HBranch": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "HCollision": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_LinearMap$LinearMap(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LinearMapRep": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_Map(a._2, b._2)) return false;
      return true;
    }
  }
  return true;
}

function __eq_LinearMap$LinearSlot(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LinearSlotRep": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_Map(a._3, b._3)) return false;
      return true;
    }
  }
  return true;
}

function __eq_IOList$IOList(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Empty": {
      return true;
    }
    case "Str": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Segments": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Deque$Deque(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Deque": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      if (!__eq_List(a._2, b._2)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Html$Safe(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Safe": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Html$TrustedHtml(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TrustedHtml": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Html$TrustedAttr(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TrustedAttr": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Html$TrustedUrl(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TrustedUrl": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Html$TrustedCss(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TrustedCss": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Html$TrustedJs(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TrustedJs": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Http$Method(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Get": {
      return true;
    }
    case "Post": {
      return true;
    }
    case "Put": {
      return true;
    }
    case "Patch": {
      return true;
    }
    case "Delete": {
      return true;
    }
    case "Head": {
      return true;
    }
    case "Options": {
      return true;
    }
    case "Trace": {
      return true;
    }
    case "Connect": {
      return true;
    }
    case "Other": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Http$Scheme(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SchemeHttp": {
      return true;
    }
    case "SchemeHttps": {
      return true;
    }
  }
  return true;
}

function __eq_Http$Status(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Status": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Http$Header(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Header": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Http$UrlError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "InvalidScheme": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "MissingHost": {
      return true;
    }
    case "InvalidPort": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "MalformedUrl": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Http$Request(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Request": {
      if (!__eq_Method(a._0, b._0)) return false;
      if (!__eq_Scheme(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_Option(a._3, b._3)) return false;
      if (a._4 !== b._4) return false;
      if (!__eq_Option(a._5, b._5)) return false;
      if (!__eq_List(a._6, b._6)) return false;
      if (a._7 !== b._7) return false;
      return true;
    }
  }
  return true;
}

function __eq_Http$Response(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Response": {
      if (!__eq_Status(a._0, b._0)) return false;
      if (!__eq_List(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_HttpTransport$TransportError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ConnectionRefused": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ConnTimeout": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SendError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "RecvError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ConnParseError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Closed": {
      return true;
    }
    case "SchemeNotSupported": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_HttpClient$TransportError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ConnectionRefused": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ConnTimeout": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SendError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "RecvError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ConnParseError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Closed": {
      return true;
    }
  }
  return true;
}

function __eq_HttpClient$HttpError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HttpTransportError": {
      if (!__eq_TransportError(a._0, b._0)) return false;
      return true;
    }
    case "StepError": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "TooManyRedirects": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_HttpClient$RequestStepEntry(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "RequestStepEntry": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_HttpClient$ResponseStepEntry(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ResponseStepEntry": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_HttpClient$ErrorRecovery(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Recover": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Fail": {
      if (!__eq_HttpError(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_HttpClient$ErrorStepEntry(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ErrorStepEntry": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_HttpClient$Client(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Client": {
      if (!__eq_List(a._0, b._0)) return false;
      if (!__eq_List(a._1, b._1)) return false;
      if (!__eq_List(a._2, b._2)) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      if (a._5 !== b._5) return false;
      return true;
    }
  }
  return true;
}

function __eq_Seq$Step(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Continue": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Halt": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Seq$Seq(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Seq": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_File$FileError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NotFound": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Permission": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "IsDirectory": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "NotEmpty": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "IoError": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_File$FileKind(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "RegularFile": {
      return true;
    }
    case "Directory": {
      return true;
    }
    case "Symlink": {
      return true;
    }
    case "OtherKind": {
      return true;
    }
  }
  return true;
}

function __eq_File$FileStat(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "FileStat": {
      if (a._0 !== b._0) return false;
      if (!__eq_FileKind(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
  }
  return true;
}

function __eq_File$Seq(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Seq": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Sort$Heap(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HLeaf": {
      return true;
    }
    case "HNode": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_Heap(a._2, b._2)) return false;
      if (!__eq_Heap(a._3, b._3)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Csv$CsvError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "FileError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CsvParseError": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Csv$CsvRow(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "CsvEof": {
      return true;
    }
    case "Row": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_WebSocket$WsFrame(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TextFrame": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "BinaryFrame": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Ping": {
      return true;
    }
    case "Pong": {
      return true;
    }
    case "Close": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_WebSocket$WsSocket(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "WsSocket": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_WebSocket$SelectResult(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "WsData": {
      if (!__eq_WsFrame(a._0, b._0)) return false;
      return true;
    }
    case "ActorMsg": {
      return true;
    }
    case "Timeout": {
      return true;
    }
  }
  return true;
}

function __eq_HttpServer$Upgrade(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NoUpgrade": {
      return true;
    }
    case "WebSocketUpgrade": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_HttpServer$Conn(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Conn": {
      if (a._0 !== b._0) return false;
      if (!__eq_Atom(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_List(a._3, b._3)) return false;
      if (a._4 !== b._4) return false;
      if (!__eq_List(a._5, b._5)) return false;
      if (a._6 !== b._6) return false;
      if (a._7 !== b._7) return false;
      if (!__eq_List(a._8, b._8)) return false;
      if (a._9 !== b._9) return false;
      if (a._10 !== b._10) return false;
      if (!__eq_List(a._11, b._11)) return false;
      if (!__eq_Upgrade(a._12, b._12)) return false;
      return true;
    }
  }
  return true;
}

function __eq_HttpServer$Server(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Server": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
  }
  return true;
}

function __eq_Set$SEntry(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SEmpty": {
      return true;
    }
    case "SLeaf": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "SBranch": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "SCollision": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Set$Set(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HamtSet": {
      if (a._0 !== b._0) return false;
      if (!__eq_SEntry(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_HashMap$HEntry(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HEmpty": {
      return true;
    }
    case "HLeaf": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "HBranch": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "HCollision": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_HashMap$HashMap(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HamtHashMap": {
      if (!__eq_HEntry(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Array$TrieNode(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TrieEmpty": {
      return true;
    }
    case "TrieLeaf": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "TrieBranch": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Array$PVec(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PVec": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_TrieNode(a._2, b._2)) return false;
      if (!__eq_List(a._3, b._3)) return false;
      return true;
    }
  }
  return true;
}

function __eq_BigInt$BigInt(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "BigInt": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Decimal$Decimal(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Decimal": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Duration$Duration(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Duration": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Bytes$Bytes(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Bytes": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Msgpack$Value(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Null": {
      return true;
    }
    case "Bool": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Int": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Str": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Bin": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "Array": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "Map": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Compress$Error(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "InvalidInput": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "InsufficientOutput": {
      return true;
    }
    case "Io": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Compress$Gzip$Level(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "BestSpeed": {
      return true;
    }
    case "Default": {
      return true;
    }
    case "BestCompression": {
      return true;
    }
    case "Custom": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Compress$Zstd$Level(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Fast": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Default": {
      return true;
    }
    case "Best": {
      return true;
    }
  }
  return true;
}

function __eq_Compress$Brotli$Mode(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Generic": {
      return true;
    }
    case "Text": {
      return true;
    }
    case "Font": {
      return true;
    }
  }
  return true;
}

function __eq_Compress$Brotli$Level(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Level": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Parser$Expected(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ExpLit": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ExpLabel": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ExpEof": {
      return true;
    }
  }
  return true;
}

function __eq_Parser$ParseErr(a, b) {
  if (a.pos !== b.pos) return false;
  if (!__eq_List(a.expected, b.expected)) return false;
  if (!__eq_List(a.context, b.context)) return false;
  return true;
}

function __eq_Parser$ParseReply(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ROk": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "RFail": {
      if (!__eq_ParseErr(a._0, b._0)) return false;
      return true;
    }
    case "RCut": {
      if (!__eq_ParseErr(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Parser$Parser(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Parser": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Toml$TomlValue(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TStr": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TInt": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TFloat": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TBool": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TNull": {
      return true;
    }
    case "TDatetime": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TArray": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "TTable": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Toml$TomlError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TomlError": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Xml$XmlNode(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Element": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      if (!__eq_List(a._2, b._2)) return false;
      return true;
    }
    case "Text": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CData": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Comment": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ProcessingInstruction": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Xml$XmlDoc(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "XmlDoc": {
      if (!__eq_Option(a._0, b._0)) return false;
      if (!__eq_XmlNode(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Xml$XmlError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "XmlError": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Xml$XmlFrame(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "XmlFrame": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      if (!__eq_List(a._2, b._2)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Yaml$YamlValue(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "YStr": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "YInt": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "YFloat": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "YBool": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "YNull": {
      return true;
    }
    case "YSeq": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "YMap": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Yaml$YamlError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "YamlError": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Socket$SocketError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ConnectionFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "WriteFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "RecvFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "RecvTimeout": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SocketOptionFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Dns$DnsError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NotFound": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ResolveError": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Udp$UdpError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "OpenFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ResolveFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ConnectFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SendFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "RecvFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Udp$UdpSocket(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "UdpSocket": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Udp$UdpAddr(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "UdpAddr": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Udp$UdpOptions(a, b) {
  if (a.reuse_addr !== b.reuse_addr) return false;
  if (a.reuse_port !== b.reuse_port) return false;
  if (a.broadcast !== b.broadcast) return false;
  if (a.gso !== b.gso) return false;
  if (a.gro !== b.gro) return false;
  if (a.recv_buffer !== b.recv_buffer) return false;
  if (a.send_buffer !== b.send_buffer) return false;
  return true;
}

function __eq_Udp$UdpStats(a, b) {
  if (a.rx_dropped !== b.rx_dropped) return false;
  if (a.tx_stalls !== b.tx_stalls) return false;
  return true;
}

function __eq_Process$ProcessResult(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ProcessResult": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Process$LiveProcess(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LiveProcess": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Cluster$NodeAddr(a, b) {
  if (a.host !== b.host) return false;
  if (a.port !== b.port) return false;
  return true;
}

function __eq_ClusterLoad$NodeLoad(a, b) {
  if (a.node_id !== b.node_id) return false;
  if (a.cpu_count !== b.cpu_count) return false;
  if (a.cpu_load_milli !== b.cpu_load_milli) return false;
  if (a.mem_total_mb !== b.mem_total_mb) return false;
  if (a.mem_avail_mb !== b.mem_avail_mb) return false;
  if (a.sampled_at !== b.sampled_at) return false;
  return true;
}

function __eq_ConsistentHash$HashRing(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HashRing": {
      if (!__eq_List(a._0, b._0)) return false;
      if (!__eq_Map(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Logger$Level(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Debug": {
      return true;
    }
    case "Info": {
      return true;
    }
    case "Warn": {
      return true;
    }
    case "Error": {
      return true;
    }
  }
  return true;
}

function __eq_Logger$LogValue(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LStr": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LInt": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LFloat": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LBool": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LAtom": {
      if (!__eq_Atom(a._0, b._0)) return false;
      return true;
    }
    case "LNull": {
      return true;
    }
  }
  return true;
}

function __eq_Logger$LogField(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LogField": {
      if (a._0 !== b._0) return false;
      if (!__eq_LogValue(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Logger$LogEntry(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LogEntry": {
      if (!__eq_Level(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (!__eq_List(a._4, b._4)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Logger$Appender(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Appender": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Logger$AppenderCall(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "AppenderCall": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (!__eq_List(a._4, b._4)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Diagnostics$CrashKind(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Panic": {
      return true;
    }
    case "ActorCrashed": {
      return true;
    }
    case "TaskFailed": {
      return true;
    }
  }
  return true;
}

function __eq_Diagnostics$DiagnosticValue(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DStr": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "DInt": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "DFloat": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "DBool": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "DNull": {
      return true;
    }
  }
  return true;
}

function __eq_Diagnostics$SourceLocation(a, b) {
  if (a.file !== b.file) return false;
  if (a.line !== b.line) return false;
  return true;
}

function __eq_Diagnostics$StackFrame(a, b) {
  if (a.name !== b.name) return false;
  if (a.file !== b.file) return false;
  if (a.line !== b.line) return false;
  return true;
}

function __eq_Diagnostics$ProcessInfo(a, b) {
  if (a.pid !== b.pid) return false;
  if (a.supervised !== b.supervised) return false;
  return true;
}

function __eq_Diagnostics$CrashReport(a, b) {
  if (!__eq_CrashKind(a.kind, b.kind)) return false;
  if (a.message !== b.message) return false;
  if (!__eq_Option(a.location, b.location)) return false;
  if (!__eq_List(a.backtrace, b.backtrace)) return false;
  if (!__eq_ProcessInfo(a.process, b.process)) return false;
  if (!__eq_List(a.context, b.context)) return false;
  return true;
}

function __eq_Diagnostics$ObserverHandle(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ObserverHandle": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Diagnostics$DiagFrame(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DiagFrame": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Diagnostics$DiagCrash(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DiagCrash": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_List(a._2, b._2)) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      if (!__eq_List(a._5, b._5)) return false;
      if (a._6 !== b._6) return false;
      if (a._7 !== b._7) return false;
      return true;
    }
  }
  return true;
}

function __eq_Actor$InspectError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "InspectTimeout": {
      return true;
    }
    case "InspectDead": {
      return true;
    }
    case "InspectSelf": {
      return true;
    }
    case "InspectFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Flow$Stage(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Stage": {
      if (!__eq_Seq(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Json$JsonValue(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Null": {
      return true;
    }
    case "Bool": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Number": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Str": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Array": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "Object": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Json$JsonPathStep(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "JPathField": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "JPathIndex": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Json$DecodeError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DecodeError": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Json$JsonPath(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Key": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Index": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_JsonStream$Event(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "EvObjStart": {
      return true;
    }
    case "EvObjEnd": {
      return true;
    }
    case "EvArrStart": {
      return true;
    }
    case "EvArrEnd": {
      return true;
    }
    case "EvKey": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "EvStr": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "EvNum": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "EvNumRaw": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "EvBool": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "EvNull": {
      return true;
    }
  }
  return true;
}

function __eq_JsonStream$JsonStreamError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "EMalformed": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "EDepthLimit": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ETokenLimit": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ETruncated": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_JsonStream$JsonLimits(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "JsonLimits": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_JsonStream$JsMode(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "MTop": {
      return true;
    }
    case "MDone": {
      return true;
    }
    case "MArrFirst": {
      return true;
    }
    case "MArrValue": {
      return true;
    }
    case "MArrNext": {
      return true;
    }
    case "MObjFirst": {
      return true;
    }
    case "MObjKey": {
      return true;
    }
    case "MObjColon": {
      return true;
    }
    case "MObjValue": {
      return true;
    }
    case "MObjNext": {
      return true;
    }
  }
  return true;
}

function __eq_JsonStream$JsEsc(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SPlain": {
      return true;
    }
    case "SEsc": {
      return true;
    }
    case "SHex": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_JsonStream$JsPartial(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PNone": {
      return true;
    }
    case "PLit": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "PStr": {
      if (!__eq_List(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_JsEsc(a._2, b._2)) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      return true;
    }
    case "PNum": {
      if (!__eq_List(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_JsonStream$JsCfg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "JsCfg": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
  }
  return true;
}

function __eq_JsonStream$JsState(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "StOk": {
      if (!__eq_JsCfg(a._0, b._0)) return false;
      if (!__eq_JsMode(a._1, b._1)) return false;
      if (!__eq_List(a._2, b._2)) return false;
      if (a._3 !== b._3) return false;
      if (!__eq_JsPartial(a._4, b._4)) return false;
      if (a._5 !== b._5) return false;
      return true;
    }
  }
  return true;
}

function __eq_JsonStream$JsFrame(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "FArr": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "FObjK": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "FObjV": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Recon$ActorInfo(a, b) {
  if (a.pid !== b.pid) return false;
  if (a.type_name !== b.type_name) return false;
  if (!__eq_List(a.names, b.names)) return false;
  if (a.status !== b.status) return false;
  if (a.mbox !== b.mbox) return false;
  if (a.held !== b.held) return false;
  if (!__eq_Option(a.parent, b.parent)) return false;
  if (a.children !== b.children) return false;
  if (a.slices !== b.slices) return false;
  if (a.msgs_in !== b.msgs_in) return false;
  if (a.msgs_out !== b.msgs_out) return false;
  if (a.crashes !== b.crashes) return false;
  if (a.child_crashes !== b.child_crashes) return false;
  return true;
}

function __eq_Recon$Supervision(a, b) {
  if (a.policy !== b.policy) return false;
  if (a.limit !== b.limit) return false;
  if (a.window_secs !== b.window_secs) return false;
  if (a.held !== b.held) return false;
  return true;
}

function __eq_Recon$TopRow(a, b) {
  if (a.pid !== b.pid) return false;
  if (a.type_name !== b.type_name) return false;
  if (!__eq_List(a.names, b.names)) return false;
  if (a.status !== b.status) return false;
  if (a.value !== b.value) return false;
  if (a.mbox !== b.mbox) return false;
  if (a.stack_bytes !== b.stack_bytes) return false;
  if (a.link !== b.link) return false;
  if (!__eq_Option(a.parent, b.parent)) return false;
  if (a.parent_type !== b.parent_type) return false;
  if (!__eq_Option(a.spawned_by, b.spawned_by)) return false;
  if (a.children !== b.children) return false;
  if (a.crashes !== b.crashes) return false;
  if (a.child_crashes !== b.child_crashes) return false;
  if (!__eq_Option(a.supervision, b.supervision)) return false;
  return true;
}

function __eq_Recon$SupNode(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SupNode": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_List(a._2, b._2)) return false;
      if (!__eq_List(a._3, b._3)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Recon$NodeStats(a, b) {
  if (a.actors !== b.actors) return false;
  if (a.queued !== b.queued) return false;
  if (!__eq_Option(a.rss_bytes, b.rss_bytes)) return false;
  if (!__eq_Option(a.live_objects, b.live_objects)) return false;
  if (a.schedulers !== b.schedulers) return false;
  if (a.crashes_total !== b.crashes_total) return false;
  return true;
}

function __eq_Recon$CrashReport(a, b) {
  if (a.seq !== b.seq) return false;
  if (a.kind !== b.kind) return false;
  if (!__eq_Option(a.pid, b.pid)) return false;
  if (a.type_name !== b.type_name) return false;
  if (!__eq_Option(a.supervisor, b.supervisor)) return false;
  if (a.restart !== b.restart) return false;
  if (a.at_ms !== b.at_ms) return false;
  return true;
}

function __eq_Recon$EpochReport(a, b) {
  if (a.current !== b.current) return false;
  if (!__eq_List(a.pins, b.pins)) return false;
  return true;
}

function __eq_Recon$FnVersion(a, b) {
  if (a.name !== b.name) return false;
  if (a.impl_hash !== b.impl_hash) return false;
  if (!__eq_Option(a.baseline_hash, b.baseline_hash)) return false;
  if (a.patched !== b.patched) return false;
  if (a.epoch !== b.epoch) return false;
  if (a.activated_at_ms !== b.activated_at_ms) return false;
  return true;
}

function __eq_Diagnose$Finding(a, b) {
  if (a.id !== b.id) return false;
  if (a.severity !== b.severity) return false;
  if (!__eq_List(a.rows, b.rows)) return false;
  if (a.next !== b.next) return false;
  return true;
}

function __eq_Trace$Limit(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "MaxEvents": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Rate": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Trace$EventKind(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Sent": {
      return true;
    }
    case "Received": {
      return true;
    }
    case "Spawned": {
      return true;
    }
    case "Exited": {
      return true;
    }
    case "Dropped": {
      return true;
    }
  }
  return true;
}

function __eq_Trace$Options(a, b) {
  if (!__eq_List(a.fns, b.fns)) return false;
  if (!__eq_List(a.events, b.events)) return false;
  if (!__eq_List(a.pids, b.pids)) return false;
  return true;
}

function __eq_Trace$ActorEvent(a, b) {
  if (!__eq_EventKind(a.kind, b.kind)) return false;
  if (a.pid !== b.pid) return false;
  if (!__eq_Option(a.peer, b.peer)) return false;
  if (!__eq_Option(a.msg_tag, b.msg_tag)) return false;
  if (!__eq_Option(a.reason, b.reason)) return false;
  if (a.epoch !== b.epoch) return false;
  if (a.at_ns !== b.at_ns) return false;
  return true;
}

function __eq_Trace$TraceId(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TraceId": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Trace$CallEvent(a, b) {
  if (a.caller !== b.caller) return false;
  if (a.fn_name !== b.fn_name) return false;
  if (a.epoch !== b.epoch) return false;
  if (a.at_ns !== b.at_ns) return false;
  return true;
}

function __eq_Trace$Batch(a, b) {
  if (!__eq_List(a.events, b.events)) return false;
  if (!__eq_List(a.actor_events, b.actor_events)) return false;
  if (a.recorded !== b.recorded) return false;
  if (a.dropped !== b.dropped) return false;
  if (a.rate_dropped !== b.rate_dropped) return false;
  if (a.queued !== b.queued) return false;
  if (a.done !== b.done) return false;
  if (!__eq_Option(a.why, b.why)) return false;
  return true;
}

function __eq_Trace$TraceError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LimitOutOfRange": {
      return true;
    }
    case "UnknownFunction": {
      return true;
    }
    case "TooManySessions": {
      return true;
    }
    case "NoSuchSession": {
      return true;
    }
    case "BadRequest": {
      return true;
    }
    case "PidsRequired": {
      return true;
    }
    case "UnknownPid": {
      return true;
    }
    case "Unavailable": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Regex$RegexAtom(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "RALit": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "RAAny": {
      return true;
    }
    case "RAClass": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "RADigit": {
      return true;
    }
    case "RAWord": {
      return true;
    }
    case "RASpace": {
      return true;
    }
    case "RANotDigit": {
      return true;
    }
    case "RANotWord": {
      return true;
    }
    case "RANotSpace": {
      return true;
    }
  }
  return true;
}

function __eq_Regex$RegexQuant(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "QOne": {
      return true;
    }
    case "QZeroOrMore": {
      return true;
    }
    case "QOneOrMore": {
      return true;
    }
    case "QOptional": {
      return true;
    }
  }
  return true;
}

function __eq_Regex$RegexItem(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "RegexItem": {
      if (!__eq_RegexAtom(a._0, b._0)) return false;
      if (!__eq_RegexQuant(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Regex$RegexPattern(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "RegexPattern": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Regex$RegexOpts(a, b) {
  if (a.case_insensitive !== b.case_insensitive) return false;
  if (a.multiline !== b.multiline) return false;
  return true;
}

function __eq_DateTime$Date(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Date": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_DateTime$Time(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Time": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_DateTime$DateTime(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DateTime": {
      if (!__eq_Date(a._0, b._0)) return false;
      if (!__eq_Time(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DateTime$Tz(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Tz": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_DateTime$LocalDateTime(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LocalDateTime": {
      if (!__eq_DateTime(a._0, b._0)) return false;
      if (!__eq_Tz(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Queue$Queue(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Queue": {
      if (!__eq_List(a._0, b._0)) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_AhoCorasick$AcNode(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "AcNode": {
      if (!__eq_List(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_List(a._2, b._2)) return false;
      return true;
    }
  }
  return true;
}

function __eq_AhoCorasick$Automaton(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Automaton": {
      if (!__eq_Array$PVec(a._0, b._0)) return false;
      if (!__eq_Array$PVec(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_AhoCorasick$Match(a, b) {
  if (a.start !== b.start) return false;
  if (a.stop !== b.stop) return false;
  if (a.pattern_index !== b.pattern_index) return false;
  if (a.pattern !== b.pattern) return false;
  return true;
}

function __eq_Random$Rng(a, b) {
  if (a.s0 !== b.s0) return false;
  if (a.s1 !== b.s1) return false;
  if (a.s2 !== b.s2) return false;
  if (a.s3 !== b.s3) return false;
  return true;
}

function __eq_Gen$Thunk(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Thunk": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Gen$GenTree(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "GenTree": {
      if (a._0 !== b._0) return false;
      if (!__eq_Thunk(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Gen$GenRng(a, b) {
  if (a.s0 !== b.s0) return false;
  if (a.s1 !== b.s1) return false;
  if (a.s2 !== b.s2) return false;
  if (a.s3 !== b.s3) return false;
  return true;
}

function __eq_Gen$Generator(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Generator": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Check$CheckConfig(a, b) {
  if (a.num_runs !== b.num_runs) return false;
  if (!__eq_Option(a.seed, b.seed)) return false;
  if (a.max_shrink_steps !== b.max_shrink_steps) return false;
  if (a.max_size !== b.max_size) return false;
  return true;
}

function __eq_Stats$QuantileMethod(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "InvertedCdf": {
      return true;
    }
    case "AveragedInvertedCdf": {
      return true;
    }
    case "ClosestObservation": {
      return true;
    }
    case "InterpolatedInvertedCdf": {
      return true;
    }
    case "Hazen": {
      return true;
    }
    case "Weibull": {
      return true;
    }
    case "Linear": {
      return true;
    }
    case "MedianUnbiased": {
      return true;
    }
    case "NormalUnbiased": {
      return true;
    }
  }
  return true;
}

function __eq_Plot$Color(a, b) {
  if (a.r !== b.r) return false;
  if (a.g !== b.g) return false;
  if (a.b !== b.b) return false;
  return true;
}

function __eq_Plot$Style(a, b) {
  if (!__eq_Color(a.line_color, b.line_color)) return false;
  if (!__eq_Color(a.fill_color, b.fill_color)) return false;
  if (a.line_width !== b.line_width) return false;
  if (a.point_radius !== b.point_radius) return false;
  if (a.font_size !== b.font_size) return false;
  if (a.opacity !== b.opacity) return false;
  return true;
}

function __eq_Plot$SeriesKind(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Line": {
      return true;
    }
    case "Scatter": {
      return true;
    }
    case "Bar": {
      return true;
    }
    case "HistogramSeries": {
      return true;
    }
  }
  return true;
}

function __eq_Plot$Series(a, b) {
  if (!__eq_SeriesKind(a.kind, b.kind)) return false;
  if (!__eq_List(a.xs, b.xs)) return false;
  if (!__eq_List(a.ys, b.ys)) return false;
  if (!__eq_Option(a.label, b.label)) return false;
  if (!__eq_Style(a.style, b.style)) return false;
  return true;
}

function __eq_Plot$Axis(a, b) {
  if (!__eq_Option(a.label, b.label)) return false;
  if (!__eq_Option(a.data_min, b.data_min)) return false;
  if (!__eq_Option(a.data_max, b.data_max)) return false;
  if (a.tick_count !== b.tick_count) return false;
  return true;
}

function __eq_Plot$Plot(a, b) {
  if (!__eq_Option(a.title, b.title)) return false;
  if (!__eq_List(a.series, b.series)) return false;
  if (!__eq_Axis(a.x_axis, b.x_axis)) return false;
  if (!__eq_Axis(a.y_axis, b.y_axis)) return false;
  if (a.width !== b.width) return false;
  if (a.height !== b.height) return false;
  if (a.margin !== b.margin) return false;
  if (a.show_legend !== b.show_legend) return false;
  if (a.show_grid !== b.show_grid) return false;
  return true;
}

function __eq_DataFrame$Value(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "IntVal": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "FloatVal": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "StrVal": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "BoolVal": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "NullVal": {
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$Column(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "IntCol": {
      if (a._0 !== b._0) return false;
      if (!__eq_NativeIntArr(a._1, b._1)) return false;
      return true;
    }
    case "FloatCol": {
      if (a._0 !== b._0) return false;
      if (!__eq_NativeFloatArr(a._1, b._1)) return false;
      return true;
    }
    case "StrCol": {
      if (a._0 !== b._0) return false;
      if (!__eq_TypedArray(a._1, b._1)) return false;
      return true;
    }
    case "BoolCol": {
      if (a._0 !== b._0) return false;
      if (!__eq_TypedArray(a._1, b._1)) return false;
      return true;
    }
    case "NullableIntCol": {
      if (a._0 !== b._0) return false;
      if (!__eq_NativeIntArr(a._1, b._1)) return false;
      if (!__eq_TypedArray(a._2, b._2)) return false;
      return true;
    }
    case "NullableFloatCol": {
      if (a._0 !== b._0) return false;
      if (!__eq_NativeFloatArr(a._1, b._1)) return false;
      if (!__eq_TypedArray(a._2, b._2)) return false;
      return true;
    }
    case "NullableStrCol": {
      if (a._0 !== b._0) return false;
      if (!__eq_TypedArray(a._1, b._1)) return false;
      if (!__eq_TypedArray(a._2, b._2)) return false;
      return true;
    }
    case "NullableBoolCol": {
      if (a._0 !== b._0) return false;
      if (!__eq_TypedArray(a._1, b._1)) return false;
      if (!__eq_TypedArray(a._2, b._2)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$Row(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Row": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$DataFrame(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DataFrame": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$ColumnBuilder(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "IntBuilder": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "FloatBuilder": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "StrBuilder": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "BoolBuilder": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "NullBuilder": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$ColExpr(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Col": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LitInt": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LitFloat": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LitStr": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LitBool": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Eq": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "Neq": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "Lt": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "Lte": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "Gt": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "Gte": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "And": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "Or": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "Not": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      return true;
    }
    case "Add": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "Sub": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "Mul": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "Div": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "StrContains": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "StrStartsWith": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "StrEndsWith": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "IsNull": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      return true;
    }
    case "IsNotNull": {
      if (!__eq_ColExpr(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$SortDir(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Asc": {
      return true;
    }
    case "Desc": {
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$JoinKind(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Inner": {
      return true;
    }
    case "Left": {
      return true;
    }
    case "Right": {
      return true;
    }
    case "Outer": {
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$Plan(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Source": {
      if (!__eq_DataFrame(a._0, b._0)) return false;
      return true;
    }
    case "Select": {
      if (!__eq_Plan(a._0, b._0)) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "Filter": {
      if (!__eq_Plan(a._0, b._0)) return false;
      if (!__eq_ColExpr(a._1, b._1)) return false;
      return true;
    }
    case "WithColumn": {
      if (!__eq_Plan(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "SortBy": {
      if (!__eq_Plan(a._0, b._0)) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "Limit": {
      if (!__eq_Plan(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Offset": {
      if (!__eq_Plan(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Rename": {
      if (!__eq_Plan(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "DropCols": {
      if (!__eq_Plan(a._0, b._0)) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "Join": {
      if (!__eq_Plan(a._0, b._0)) return false;
      if (!__eq_Plan(a._1, b._1)) return false;
      if (!__eq_List(a._2, b._2)) return false;
      if (!__eq_JoinKind(a._3, b._3)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$LazyFrame(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LazyFrame": {
      if (!__eq_Plan(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$CsvWriteOpts(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "CsvWriteOpts": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$AggExpr(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Sum": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Mean": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Min": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Max": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Count": {
      return true;
    }
    case "CountDistinct": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Std": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Variance": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "First": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Last": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Median": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "AggAs": {
      if (!__eq_AggExpr(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$GroupKey(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "GroupKey": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$GroupedFrame(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "GroupedFrame": {
      if (!__eq_DataFrame(a._0, b._0)) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$ColStats(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ColStats": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_Option(a._3, b._3)) return false;
      if (!__eq_Option(a._4, b._4)) return false;
      if (!__eq_Option(a._5, b._5)) return false;
      if (!__eq_Option(a._6, b._6)) return false;
      if (!__eq_Option(a._7, b._7)) return false;
      if (!__eq_Option(a._8, b._8)) return false;
      if (!__eq_Option(a._9, b._9)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DataFrame$WindowExpr(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "RowNum": {
      return true;
    }
    case "Rank": {
      if (a._0 !== b._0) return false;
      if (!__eq_SortDir(a._1, b._1)) return false;
      return true;
    }
    case "DenseRank": {
      if (a._0 !== b._0) return false;
      if (!__eq_SortDir(a._1, b._1)) return false;
      return true;
    }
    case "RunningSum": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "RunningMean": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Lag": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_Value(a._2, b._2)) return false;
      return true;
    }
    case "Lead": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_Value(a._2, b._2)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Tls$TlsVersion(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Tls12": {
      return true;
    }
    case "Tls13": {
      return true;
    }
  }
  return true;
}

function __eq_Tls$TlsError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TlsHandshakeFailed": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TlsCertError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TlsReadError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TlsWriteError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TlsContextError": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TlsReadTimeout": {
      return true;
    }
  }
  return true;
}

function __eq_Tls$TlsConfig(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TlsConfig": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_List(a._3, b._3)) return false;
      if (!__eq_TlsVersion(a._4, b._4)) return false;
      if (a._5 !== b._5) return false;
      return true;
    }
  }
  return true;
}

function __eq_Tls$TlsCtx(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TlsCtx": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Tls$TlsConn(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TlsConn": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_UUID$UUID(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "UUID": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Channel$Socket(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Socket": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_List(a._3, b._3)) return false;
      if (a._4 !== b._4) return false;
      return true;
    }
  }
  return true;
}

function __eq_Channel$HandleResult(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Reply": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "NoReply": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Stop": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Channel$ChannelMailbox(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ChannelIn": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "ChannelBroadcast": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "ChannelBroadcastFrom": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
    case "ChannelPush": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "ChannelLeave": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ChannelStop": {
      return true;
    }
  }
  return true;
}

function __eq_Channel$PubSubMsg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PubSubSubscribe": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "PubSubUnsubscribe": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "PubSubBroadcast": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
  }
  return true;
}

function __eq_Channel$BroadcastMsg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "BroadcastMsg": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Channel$LeaveReason(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NormalLeave": {
      return true;
    }
    case "Disconnect": {
      return true;
    }
    case "Kicked": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Channel$ChannelRoute(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ChannelRoute": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Channel$ChannelMsg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ChannelMsg": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      return true;
    }
  }
  return true;
}

function __eq_PubSub$PubSubState(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PubSubState": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_ChannelServer$JoinResult(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "JoinOk": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "JoinErr": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_ChannelServer$ChannelConfig(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ChannelConfig": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      if (a._5 !== b._5) return false;
      return true;
    }
  }
  return true;
}

function __eq_ChannelSocket$SocketConfig(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SocketConfig": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_List(a._3, b._3)) return false;
      return true;
    }
  }
  return true;
}

function __eq_ChannelSocket$ActiveChannels(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ActiveChannels": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Presence$PresenceMeta(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PresenceMeta": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Presence$PresenceEntry(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PresenceEntry": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Presence$PresenceState(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PresenceState": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Config$Value(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "CfgInt": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CfgFloat": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CfgString": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CfgBool": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CfgAtom": {
      if (!__eq_Atom(a._0, b._0)) return false;
      return true;
    }
    case "CfgList": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Config$Codec(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Codec": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Config$Key(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Key": {
      if (a._0 !== b._0) return false;
      if (!__eq_Codec(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Config$Error(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "KeyMissing": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "KeyWrongType": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Cli$FlagArity(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "BoolFlag": {
      return true;
    }
    case "ValueFlag": {
      return true;
    }
  }
  return true;
}

function __eq_Cli$FlagSpec(a, b) {
  if (a.long !== b.long) return false;
  if (!__eq_Option(a.short, b.short)) return false;
  if (!__eq_FlagArity(a.arity, b.arity)) return false;
  if (!__eq_Option(a.default, b.default)) return false;
  if (a.required !== b.required) return false;
  if (a.help !== b.help) return false;
  return true;
}

function __eq_Cli$CliError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "UnknownFlag": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "MissingValue": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "MissingRequired": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Cli$ParsedArgs(a, b) {
  if (!__eq_List(a.values, b.values)) return false;
  if (!__eq_List(a.positional, b.positional)) return false;
  return true;
}

function __eq_OrderedMap$Tree(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Leaf": {
      return true;
    }
    case "Node": {
      if (!__eq_Tree(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_Tree(a._3, b._3)) return false;
      if (a._4 !== b._4) return false;
      return true;
    }
  }
  return true;
}

function __eq_SortedSet$AvlTree(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "AvlLeaf": {
      return true;
    }
    case "AvlNode": {
      if (!__eq_AvlTree(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_AvlTree(a._2, b._2)) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
  }
  return true;
}

function __eq_Range$IntRange(a, b) {
  if (a.start !== b.start) return false;
  if (a.stop !== b.stop) return false;
  if (a.step !== b.step) return false;
  return true;
}

function __eq_MlKem$KeyPair(a, b) {
  if (!__eq_Bytes(a.public_key, b.public_key)) return false;
  if (!__eq_Bytes(a.secret_key, b.secret_key)) return false;
  return true;
}

function __eq_MlDsa$KeyPair(a, b) {
  if (!__eq_Bytes(a.public_key, b.public_key)) return false;
  if (!__eq_Bytes(a.secret_key, b.secret_key)) return false;
  return true;
}

function __eq_Signal$Sig(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Term": {
      return true;
    }
    case "Int": {
      return true;
    }
    case "Hup": {
      return true;
    }
    case "Usr1": {
      return true;
    }
    case "Usr2": {
      return true;
    }
  }
  return true;
}

function __eq_RRB$Vec(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Vec": {
      if (!__eq_Array$PVec(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_RRB$Slice(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Slice": {
      if (!__eq_Array$PVec(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Uri$URI(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "URI": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_Option(a._2, b._2)) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      if (a._5 !== b._5) return false;
      return true;
    }
  }
  return true;
}

function __eq_Handle$Handle(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Handle": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_VectorClock$VectorClock(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "VectorClock": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_VectorClock$ClockOrder(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Before": {
      return true;
    }
    case "After": {
      return true;
    }
    case "Concurrent": {
      return true;
    }
    case "Equal": {
      return true;
    }
  }
  return true;
}

function __eq_CRDT$GCounter$T(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "GCounter": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_CRDT$PNCounter$T(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PNCounter": {
      if (!__eq_Map(a._0, b._0)) return false;
      if (!__eq_Map(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_CRDT$LWWRegister$T(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LWWRegister": {
      if (a._0 !== b._0) return false;
      if (!__eq_VectorClock(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_CRDT$ORSet$T(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ORSet": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Merkle$MerkleTree(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "MLeaf": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "MBranch": {
      if (a._0 !== b._0) return false;
      if (!__eq_MerkleTree(a._1, b._1)) return false;
      if (!__eq_MerkleTree(a._2, b._2)) return false;
      return true;
    }
  }
  return true;
}

function __eq_NodeCert$Cert(a, b) {
  if (a.node !== b.node) return false;
  if (!__eq_List(a.roles, b.roles)) return false;
  if (!__eq_List(a.flags, b.flags)) return false;
  if (a.not_after !== b.not_after) return false;
  if (a.issuer !== b.issuer) return false;
  if (a.pubkey !== b.pubkey) return false;
  if (a.serial !== b.serial) return false;
  return true;
}

function __eq_NodeCert$Signed(a, b) {
  if (!__eq_Cert(a.cert, b.cert)) return false;
  if (!__eq_List(a.body, b.body)) return false;
  if (!__eq_Bytes(a.signature, b.signature)) return false;
  return true;
}

function __eq_NodeCert$Revocation(a, b) {
  if (a.node !== b.node) return false;
  if (a.serial !== b.serial) return false;
  if (a.issued_at !== b.issued_at) return false;
  return true;
}

function __eq_NodeCert$SignedRevocation(a, b) {
  if (!__eq_Revocation(a.rev, b.rev)) return false;
  if (!__eq_List(a.body, b.body)) return false;
  if (!__eq_Bytes(a.signature, b.signature)) return false;
  return true;
}

function __eq_NodeCert$Credentials(a, b) {
  if (!__eq_Signed(a.signed, b.signed)) return false;
  if (!__eq_Bytes(a.secret_key, b.secret_key)) return false;
  if (!__eq_Bytes(a.operator_pubkey, b.operator_pubkey)) return false;
  if (a.revoked !== b.revoked) return false;
  return true;
}

function __eq_ClusterAuth$Auth(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Secret": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Certified": {
      if (!__eq_NodeCert$Credentials(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_ClusterAuth$FrameKeys(a, b) {
  if (!__eq_Bytes(a.tx_key, b.tx_key)) return false;
  if (!__eq_Bytes(a.rx_key, b.rx_key)) return false;
  return true;
}

function __eq_NodeIdentity$Identity(a, b) {
  if (a.name !== b.name) return false;
  if (a.node_id !== b.node_id) return false;
  if (a.incarnation !== b.incarnation) return false;
  return true;
}

function __eq_Handshake$HelloCert(a, b) {
  if (!__eq_List(a.cert, b.cert)) return false;
  if (!__eq_List(a.eph, b.eph)) return false;
  return true;
}

function __eq_Handshake$Hello(a, b) {
  if (!__eq_NodeIdentity$Identity(a.identity, b.identity)) return false;
  if (a.nonce !== b.nonce) return false;
  if (a.role !== b.role) return false;
  if (a.addr !== b.addr) return false;
  if (!__eq_Option(a.cert, b.cert)) return false;
  return true;
}

function __eq_GlobalPid$Pid(a, b) {
  if (a.node_id !== b.node_id) return false;
  if (a.local_pid !== b.local_pid) return false;
  if (a.creation !== b.creation) return false;
  return true;
}

function __eq_RemoteCall$RemoteRef(a, b) {
  if (a.module_name !== b.module_name) return false;
  if (a.fn_name !== b.fn_name) return false;
  if (a.sig_hash !== b.sig_hash) return false;
  if (a.impl_hash !== b.impl_hash) return false;
  return true;
}

function __eq_RemoteCall$CallError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DeadlineExceeded": {
      return true;
    }
    case "NoConnection": {
      return true;
    }
    case "RemoteExit": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TypeMismatch": {
      return true;
    }
    case "VersionSkew": {
      return true;
    }
    case "NoTarget": {
      return true;
    }
    case "Forbidden": {
      return true;
    }
  }
  return true;
}

function __eq_RemoteCall$Verdict(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Accept": {
      return true;
    }
    case "Reject": {
      if (!__eq_CallError(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_RemoteCall$ReplyResult(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Returned": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "Failed": {
      if (!__eq_CallError(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_RemoteCall$CallRequest(a, b) {
  if (!__eq_RemoteRef(a.fref, b.fref)) return false;
  if (!__eq_List(a.args, b.args)) return false;
  if (!__eq_Pid(a.reply_to, b.reply_to)) return false;
  if (a.deadline !== b.deadline) return false;
  if (a.correlation !== b.correlation) return false;
  return true;
}

function __eq_RemoteCall$CallReply(a, b) {
  if (a.correlation !== b.correlation) return false;
  if (!__eq_ReplyResult(a.result, b.result)) return false;
  return true;
}

function __eq_NodeRpc$Target(a, b) {
  if (a.sig_hash !== b.sig_hash) return false;
  if (a.impl_hash !== b.impl_hash) return false;
  if (a.invoke !== b.invoke) return false;
  return true;
}

function __eq_NodeRpc$Targets(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Targets": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_PeerRegistry$Peer(a, b) {
  if (a.node_id !== b.node_id) return false;
  if (!__eq_NodeIdentity$Identity(a.identity, b.identity)) return false;
  if (a.fd !== b.fd) return false;
  if (a.data_fd !== b.data_fd) return false;
  return true;
}

function __eq_PeerRegistry$Registry(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Registry": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_NetKernel$MacKeys(a, b) {
  if (!__eq_Bytes(a.tx_key, b.tx_key)) return false;
  if (!__eq_Bytes(a.rx_key, b.rx_key)) return false;
  return true;
}

function __eq_NetKernel$Authed(a, b) {
  if (!__eq_NodeIdentity$Identity(a.identity, b.identity)) return false;
  if (a.role !== b.role) return false;
  if (a.addr !== b.addr) return false;
  if (!__eq_Option(a.cert, b.cert)) return false;
  if (a.mac !== b.mac) return false;
  return true;
}

function __eq_Membership$MemberStatus(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Alive": {
      return true;
    }
    case "Suspect": {
      return true;
    }
    case "Dead": {
      return true;
    }
  }
  return true;
}

function __eq_Membership$Member(a, b) {
  if (a.node_id !== b.node_id) return false;
  if (!__eq_MemberStatus(a.status, b.status)) return false;
  if (a.incarnation !== b.incarnation) return false;
  if (a.creation !== b.creation) return false;
  if (a.name !== b.name) return false;
  if (a.addr !== b.addr) return false;
  return true;
}

function __eq_Membership$Members(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Members": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Swim$Config(a, b) {
  if (a.ack_timeout_ms !== b.ack_timeout_ms) return false;
  if (a.suspect_timeout_ms !== b.suspect_timeout_ms) return false;
  if (a.indirect_k !== b.indirect_k) return false;
  return true;
}

function __eq_Swim$Probe(a, b) {
  if (a.target !== b.target) return false;
  if (a.sent_at !== b.sent_at) return false;
  if (a.indirect_sent !== b.indirect_sent) return false;
  if (a.acked !== b.acked) return false;
  return true;
}

function __eq_Swim$State(a, b) {
  if (a.me !== b.me) return false;
  if (a.incarnation !== b.incarnation) return false;
  if (!__eq_Members(a.members, b.members)) return false;
  if (!__eq_Config(a.config, b.config)) return false;
  if (!__eq_Option(a.probe, b.probe)) return false;
  if (!__eq_Map(a.suspect_deadlines, b.suspect_deadlines)) return false;
  return true;
}

function __eq_Swim$Action(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SendPing": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SendPingReq": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Gossip": {
      if (!__eq_Member(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_SwimDriver$State(a, b) {
  if (!__eq_Swim$State(a.swim, b.swim)) return false;
  if (!__eq_Random$Rng(a.rng, b.rng)) return false;
  if (a.period_ms !== b.period_ms) return false;
  if (a.period_end !== b.period_end) return false;
  if (!__eq_Map(a.peer_loads, b.peer_loads)) return false;
  if (a.anti_entropy_next !== b.anti_entropy_next) return false;
  return true;
}

function __eq_SwimDriver$Event(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PingAck": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "GossipFrame": {
      if (!__eq_Member(a._0, b._0)) return false;
      return true;
    }
    case "GossipWithLoad": {
      if (!__eq_Member(a._0, b._0)) return false;
      if (!__eq_NodeLoad(a._1, b._1)) return false;
      return true;
    }
    case "PeerDown": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ConnLost": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_SwimDriver$WireMsg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SwimPing": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SwimPingAck": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SwimPingReq": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "SwimGossip": {
      if (a._0 !== b._0) return false;
      if (!__eq_MemberStatus(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "SwimGossipLoad": {
      if (a._0 !== b._0) return false;
      if (!__eq_MemberStatus(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_NodeLoad(a._3, b._3)) return false;
      return true;
    }
  }
  return true;
}

function __eq_GlobalRegistry$Entry(a, b) {
  if (a.node_id !== b.node_id) return false;
  if (a.pid !== b.pid) return false;
  if (!__eq_VectorClock(a.clock, b.clock)) return false;
  if (a.present !== b.present) return false;
  if (a.creation !== b.creation) return false;
  if (a.registrant !== b.registrant) return false;
  if (a.retired_at !== b.retired_at) return false;
  return true;
}

function __eq_GlobalRegistry$Names(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Names": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_NodeSend$SendError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NoConnection": {
      return true;
    }
    case "Refused": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_NodeSend$Delivery(a, b) {
  if (a.seq !== b.seq) return false;
  if (a.to_local_pid !== b.to_local_pid) return false;
  if (a.to_creation !== b.to_creation) return false;
  if (a.type_tag !== b.type_tag) return false;
  if (!__eq_List(a.payload, b.payload)) return false;
  if (a.schema !== b.schema) return false;
  if (a.from_node !== b.from_node) return false;
  return true;
}

function __eq_NodeQueue$Policy(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DropNew": {
      return true;
    }
    case "DropOld": {
      return true;
    }
    case "BlockSender": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Unbounded": {
      return true;
    }
  }
  return true;
}

function __eq_NodeQueue$EnqueueError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Backpressure": {
      return true;
    }
    case "NoConnection": {
      return true;
    }
    case "NotAuthorized": {
      return true;
    }
  }
  return true;
}

function __eq_NodeQueue$WriterState(a, b) {
  if (a.fd !== b.fd) return false;
  if (a.granted !== b.granted) return false;
  if (a.sent !== b.sent) return false;
  if (!__eq_Deque$Deque(a.pending, b.pending)) return false;
  if (!__eq_List(a.evicted, b.evicted)) return false;
  if (a.budget !== b.budget) return false;
  if (a.dead !== b.dead) return false;
  if (!__eq_Deque$Deque(a.waiting, b.waiting)) return false;
  if (!__eq_Deque$Deque(a.waiters, b.waiters)) return false;
  return true;
}

function __eq_NodeQueue__Writer_State(a, b) {
  if (a.budget !== b.budget) return false;
  if (a.dead !== b.dead) return false;
  if (!__eq_List(a.evicted, b.evicted)) return false;
  if (a.fd !== b.fd) return false;
  if (a.granted !== b.granted) return false;
  if (!__eq_Deque$Deque(a.pending, b.pending)) return false;
  if (a.sent !== b.sent) return false;
  if (!__eq_Deque$Deque(a.waiters, b.waiters)) return false;
  if (!__eq_Deque$Deque(a.waiting, b.waiting)) return false;
  return true;
}

function __eq_NodeQueue__Writer_Msg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TakeEvicted": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Wait": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Configure": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Enqueue": {
      if (a._0 !== b._0) return false;
      if (!__eq_Bytes(a._1, b._1)) return false;
      return true;
    }
    case "EnqueueEvicting": {
      if (a._0 !== b._0) return false;
      if (!__eq_Bytes(a._1, b._1)) return false;
      return true;
    }
    case "Credit": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Waiting": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_Bytes(a._2, b._2)) return false;
      return true;
    }
    case "Withdraw": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Close": {
      return true;
    }
    case "CloseFd": {
      return true;
    }
  }
  return true;
}

function __eq_NodeQueue__Writer_Actor(a, b) {
  if (a.$d_dispatch !== b.$d_dispatch) return false;
  if (a.$e_alive !== b.$e_alive) return false;
  if (a.budget !== b.budget) return false;
  if (a.dead !== b.dead) return false;
  if (!__eq_List(a.evicted, b.evicted)) return false;
  if (a.fd !== b.fd) return false;
  if (a.granted !== b.granted) return false;
  if (!__eq_Deque$Deque(a.pending, b.pending)) return false;
  if (a.sent !== b.sent) return false;
  if (!__eq_Deque$Deque(a.waiters, b.waiters)) return false;
  if (!__eq_Deque$Deque(a.waiting, b.waiting)) return false;
  return true;
}

function __eq_NodeQueue$WriterReq(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "EvictedReq": {
      return true;
    }
    case "WaitReq": {
      return true;
    }
  }
  return true;
}

function __eq_DistLink$DownReason(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Normal": {
      return true;
    }
    case "Killed": {
      return true;
    }
    case "Crash": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "NodeDown": {
      return true;
    }
  }
  return true;
}

function __eq_DistLink$MonitorRef(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "MonitorRef": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_DistLink$PendingMonitor(a, b) {
  if (!__eq_MonitorRef(a.ref, b.ref)) return false;
  if (a.target_node !== b.target_node) return false;
  if (a.target_pid !== b.target_pid) return false;
  if (!__eq_GlobalPid$Pid(a.watcher_pid, b.watcher_pid)) return false;
  return true;
}

function __eq_DistLink$MonitorTable(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "MonitorTable": {
      if (!__eq_Map(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_DistSupervisor$RestartStrategy(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Permanent": {
      return true;
    }
    case "Transient": {
      return true;
    }
    case "Temporary": {
      return true;
    }
  }
  return true;
}

function __eq_DistSupervisor$SupervisionStrategy(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "OneForOne": {
      return true;
    }
    case "OneForAll": {
      return true;
    }
    case "RestForOne": {
      return true;
    }
  }
  return true;
}

function __eq_DistSupervisor$RemoteChild(a, b) {
  if (!__eq_RemoteRef(a.fn_ref, b.fn_ref)) return false;
  if (a.node_id !== b.node_id) return false;
  if (!__eq_RestartStrategy(a.restart, b.restart)) return false;
  return true;
}

function __eq_DistSupervisor$ChildState(a, b) {
  if (!__eq_RemoteChild(a.spec, b.spec)) return false;
  if (!__eq_GlobalPid$Pid(a.global_pid, b.global_pid)) return false;
  if (!__eq_DistLink$MonitorRef(a.ref, b.ref)) return false;
  return true;
}

function __eq_DistSupervisor$State(a, b) {
  if (!__eq_SupervisionStrategy(a.sup_strategy, b.sup_strategy)) return false;
  if (!__eq_List(a.children, b.children)) return false;
  return true;
}

function __eq_Session$Ops(a, b) {
  if (a.register !== b.register) return false;
  if (a.emit !== b.emit) return false;
  if (a.suspend !== b.suspend) return false;
  if (a.close !== b.close) return false;
  if (a.fail !== b.fail) return false;
  if (a.on_cancel !== b.on_cancel) return false;
  if (a.leave !== b.leave) return false;
  if (a.on_crash !== b.on_crash) return false;
  if (a.suspend_at_boundary !== b.suspend_at_boundary) return false;
  if (a.on_drain !== b.on_drain) return false;
  return true;
}

function __eq_Session$Outcome(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Finished": {
      return true;
    }
    case "Drained": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Session$InProcess(a, b) {
  if (!__eq_Ops(a.ops, b.ops)) return false;
  if (a.drain !== b.drain) return false;
  if (a.take !== b.take) return false;
  if (a.crash !== b.crash) return false;
  if (a.queued !== b.queued) return false;
  if (a.step !== b.step) return false;
  if (a.drain_role !== b.drain_role) return false;
  if (a.undelivered !== b.undelivered) return false;
  if (a.drained !== b.drained) return false;
  if (a.sent !== b.sent) return false;
  if (a.consumed !== b.consumed) return false;
  if (a.returned !== b.returned) return false;
  if (a.close !== b.close) return false;
  return true;
}

function __eq_Session$InProcessState(a, b) {
  if (!__eq_Vault(a.handlers, b.handlers)) return false;
  if (!__eq_Vault(a.waiting, b.waiting)) return false;
  if (!__eq_Vault(a.cancel_hs, b.cancel_hs)) return false;
  if (!__eq_Vault(a.crash_hs, b.crash_hs)) return false;
  if (!__eq_Vault(a.drain_hs, b.drain_hs)) return false;
  if (!__eq_Vault(a.boundary, b.boundary)) return false;
  if (!__eq_Vault(a.draining, b.draining)) return false;
  if (!__eq_Vault(a.undeliv, b.undeliv)) return false;
  if (!__eq_Vault(a.gone, b.gone)) return false;
  if (!__eq_Vault(a.meta, b.meta)) return false;
  if (!__eq_Vault(a.roles, b.roles)) return false;
  if (!__eq_Vault(a.queue, b.queue)) return false;
  if (a.trace !== b.trace) return false;
  return true;
}

function __eq_Session$Theory$SessionGlobal(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "GEnd": {
      return true;
    }
    case "GMsg": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_SessionGlobal(a._3, b._3)) return false;
      return true;
    }
    case "GChoice": {
      if (a._0 !== b._0) return false;
      if (!__eq_SessionGBranches(a._1, b._1)) return false;
      return true;
    }
    case "GLoop": {
      if (!__eq_SessionGlobal(a._0, b._0)) return false;
      if (!__eq_SessionGlobal(a._1, b._1)) return false;
      return true;
    }
    case "GVar": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Session$Theory$SessionGBranches(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "GBNil": {
      return true;
    }
    case "GBCons": {
      if (a._0 !== b._0) return false;
      if (!__eq_SessionGlobal(a._1, b._1)) return false;
      if (!__eq_SessionGBranches(a._2, b._2)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Session$Theory$SessionLocal(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LEnd": {
      return true;
    }
    case "LSend": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_SessionLocal(a._2, b._2)) return false;
      return true;
    }
    case "LRecv": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_SessionLocal(a._2, b._2)) return false;
      return true;
    }
    case "LChoose": {
      if (!__eq_SessionLBranches(a._0, b._0)) return false;
      return true;
    }
    case "LOffer": {
      if (!__eq_SessionLBranches(a._0, b._0)) return false;
      return true;
    }
    case "LRec": {
      if (!__eq_SessionLocal(a._0, b._0)) return false;
      return true;
    }
    case "LVar": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Session$Theory$SessionLBranches(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LBNil": {
      return true;
    }
    case "LBCons": {
      if (a._0 !== b._0) return false;
      if (!__eq_SessionLocal(a._1, b._1)) return false;
      if (!__eq_SessionLBranches(a._2, b._2)) return false;
      return true;
    }
  }
  return true;
}

function __eq_ClusterNode$CnConfig(a, b) {
  if (a.name !== b.name) return false;
  if (a.listen_port !== b.listen_port) return false;
  if (a.advertise !== b.advertise) return false;
  if (!__eq_List(a.seeds, b.seeds)) return false;
  if (a.secret !== b.secret) return false;
  if (a.creation !== b.creation) return false;
  if (!__eq_Swim$Config(a.swim, b.swim)) return false;
  if (a.period_ms !== b.period_ms) return false;
  if (a.tick_ms !== b.tick_ms) return false;
  if (a.redial_min_ms !== b.redial_min_ms) return false;
  if (a.redial_max_ms !== b.redial_max_ms) return false;
  if (a.dial_timeout_ms !== b.dial_timeout_ms) return false;
  if (a.handshake_timeout_ms !== b.handshake_timeout_ms) return false;
  if (!__eq_ClusterAuth$Auth(a.auth, b.auth)) return false;
  if (!__eq_List(a.revocations, b.revocations)) return false;
  if (!__eq_Option(a.cert_files, b.cert_files)) return false;
  if (a.tombstone_grace_ms !== b.tombstone_grace_ms) return false;
  return true;
}

function __eq_ClusterNode$CertFiles(a, b) {
  if (a.cert !== b.cert) return false;
  if (a.key !== b.key) return false;
  if (a.poll_ms !== b.poll_ms) return false;
  return true;
}

function __eq_ClusterNode$NodeInfo(a, b) {
  if (a.node_id !== b.node_id) return false;
  if (a.name !== b.name) return false;
  if (a.addr !== b.addr) return false;
  if (a.creation !== b.creation) return false;
  if (a.incarnation !== b.incarnation) return false;
  return true;
}

function __eq_ClusterNode$NodeEvent(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NodeUp": {
      if (!__eq_NodeInfo(a._0, b._0)) return false;
      return true;
    }
    case "NodeSuspect": {
      if (!__eq_NodeInfo(a._0, b._0)) return false;
      return true;
    }
    case "NodeDead": {
      if (!__eq_NodeInfo(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "NodeRejoined": {
      if (!__eq_NodeInfo(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_ClusterNode$SecurityEvent(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HandshakeRejected": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "FrameRejected": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "RawSendRefused": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "CertReplaced": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "CertRefused": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_ClusterNode$CnLink(a, b) {
  if (a.node_id !== b.node_id) return false;
  if (a.gen !== b.gen) return false;
  if (a.cfd !== b.cfd) return false;
  if (a.dfd !== b.dfd) return false;
  if (a.dialer !== b.dialer) return false;
  if (a.cw !== b.cw) return false;
  if (a.creation !== b.creation) return false;
  if (!__eq_Bytes(a.binding, b.binding)) return false;
  if (a.cu_sent !== b.cu_sent) return false;
  if (a.cu_seen !== b.cu_seen) return false;
  return true;
}

function __eq_ClusterNode$CnHalf(a, b) {
  if (a.cfd !== b.cfd) return false;
  if (a.dfd !== b.dfd) return false;
  if (a.name !== b.name) return false;
  if (a.addr !== b.addr) return false;
  if (a.creation !== b.creation) return false;
  return true;
}

function __eq_ClusterNode$CnState(a, b) {
  if (!__eq_CnConfig(a.cfg, b.cfg)) return false;
  if (a.me !== b.me) return false;
  if (!__eq_SwimDriver$State(a.driver, b.driver)) return false;
  if (!__eq_Map(a.links, b.links)) return false;
  if (!__eq_Map(a.halves, b.halves)) return false;
  if (a.gen !== b.gen) return false;
  if (!__eq_Map(a.dialing, b.dialing)) return false;
  if (!__eq_Map(a.backoff, b.backoff)) return false;
  if (!__eq_List(a.pending, b.pending)) return false;
  if (!__eq_Map(a.relays, b.relays)) return false;
  if (!__eq_List(a.refused, b.refused)) return false;
  if (!__eq_Map(a.seed_ids, b.seed_ids)) return false;
  if (!__eq_List(a.rejoining, b.rejoining)) return false;
  if (a.stopped !== b.stopped) return false;
  if (!__eq_GlobalRegistry$Names(a.reg, b.reg)) return false;
  if (!__eq_Map(a.regs, b.regs)) return false;
  if (!__eq_Map(a.vis, b.vis)) return false;
  if (!__eq_Map(a.certs, b.certs)) return false;
  if (!__eq_List(a.revs, b.revs)) return false;
  if (!__eq_Map(a.cert_dead, b.cert_dead)) return false;
  if (a.rotated !== b.rotated) return false;
  if (a.reg_swept_at !== b.reg_swept_at) return false;
  if (a.remembered !== b.remembered) return false;
  if (a.reg_synced !== b.reg_synced) return false;
  return true;
}

function __eq_ClusterNode$NameEvent(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Bound": {
      if (a._0 !== b._0) return false;
      if (!__eq_GlobalPid$Pid(a._1, b._1)) return false;
      return true;
    }
    case "Unbound": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Lost": {
      if (a._0 !== b._0) return false;
      if (!__eq_GlobalPid$Pid(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_ClusterNode$RegisterError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Taken": {
      if (!__eq_GlobalPid$Pid(a._0, b._0)) return false;
      return true;
    }
    case "Stopped": {
      return true;
    }
  }
  return true;
}

function __eq_ClusterNode$CnEffect(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Send": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "Dial": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Install": {
      if (!__eq_CnLink(a._0, b._0)) return false;
      return true;
    }
    case "Drop": {
      if (!__eq_CnLink(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Discard": {
      if (!__eq_CnLink(a._0, b._0)) return false;
      return true;
    }
    case "Emit": {
      if (!__eq_NodeEvent(a._0, b._0)) return false;
      return true;
    }
    case "Named": {
      if (a._0 !== b._0) return false;
      if (!__eq_NameEvent(a._1, b._1)) return false;
      return true;
    }
    case "Unwatch": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_ClusterNode__CtlWriter_State(a, b) {
  if (a.dead !== b.dead) return false;
  if (a.fd !== b.fd) return false;
  return true;
}

function __eq_ClusterNode__CtlWriter_Msg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "CtlUse": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CtlWrite": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "CtlStop": {
      return true;
    }
    case "CtlClose": {
      return true;
    }
  }
  return true;
}

function __eq_ClusterNode__CtlWriter_Actor(a, b) {
  if (a.$d_dispatch !== b.$d_dispatch) return false;
  if (a.$e_alive !== b.$e_alive) return false;
  if (a.dead !== b.dead) return false;
  if (a.fd !== b.fd) return false;
  return true;
}

function __eq_ClusterNode$CnHandle(a, b) {
  if (a.pid !== b.pid) return false;
  if (a.name !== b.name) return false;
  if (a.node_id !== b.node_id) return false;
  if (a.advertise !== b.advertise) return false;
  if (!__eq_Vault(a.members, b.members)) return false;
  if (!__eq_Vault(a.subs, b.subs)) return false;
  if (!__eq_Vault(a.meta, b.meta)) return false;
  if (!__eq_Vault(a.names, b.names)) return false;
  if (!__eq_Vault(a.claims, b.claims)) return false;
  if (!__eq_Vault(a.watches, b.watches)) return false;
  if (!__eq_Vault(a.links, b.links)) return false;
  if (!__eq_Vault(a.qs, b.qs)) return false;
  if (!__eq_Vault(a.causes, b.causes)) return false;
  if (!__eq_Vault(a.routes, b.routes)) return false;
  if (!__eq_Vault(a.closes, b.closes)) return false;
  if (!__eq_Vault(a.downs, b.downs)) return false;
  if (!__eq_Vault(a.fired, b.fired)) return false;
  if (!__eq_Vault(a.failed, b.failed)) return false;
  if (!__eq_Vault(a.sfailed, b.sfailed)) return false;
  if (!__eq_Vault(a.certs, b.certs)) return false;
  if (!__eq_Vault(a.sec, b.sec)) return false;
  if (!__eq_Vault(a.revs, b.revs)) return false;
  if (!__eq_Bytes(a.op_pub, b.op_pub)) return false;
  if (!__eq_Vault(a.auth, b.auth)) return false;
  if (!__eq_Vault(a.strs, b.strs)) return false;
  if (!__eq_Vault(a.registrants, b.registrants)) return false;
  return true;
}

function __eq_ClusterNode__RegWatch_State(a, b) {
  if (a.n !== b.n) return false;
  return true;
}

function __eq_ClusterNode__RegWatch_Msg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "WatchPid": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_ClusterNode__RegWatch_Actor(a, b) {
  if (a.$d_dispatch !== b.$d_dispatch) return false;
  if (a.$e_alive !== b.$e_alive) return false;
  if (a.n !== b.n) return false;
  return true;
}

function __eq_ClusterNode__ClusterNodeActor_State(a, b) {
  if (!__eq_CnHandle(a.h, b.h)) return false;
  if (!__eq_CnState(a.st, b.st)) return false;
  if (a.started !== b.started) return false;
  return true;
}

function __eq_ClusterNode__ClusterNodeActor_Msg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Boot": {
      if (!__eq_CnState(a._0, b._0)) return false;
      if (!__eq_CnHandle(a._1, b._1)) return false;
      return true;
    }
    case "Tick": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Accepted": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      if (a._5 !== b._5) return false;
      if (!__eq_Option(a._6, b._6)) return false;
      return true;
    }
    case "Dialed": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      if (a._5 !== b._5) return false;
      if (a._6 !== b._6) return false;
      if (!__eq_Option(a._7, b._7)) return false;
      return true;
    }
    case "SeedIsSelf": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "DialFailed": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "CtlFrame": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_List(a._3, b._3)) return false;
      return true;
    }
    case "ReplaceCert": {
      if (!__eq_NodeCert$Signed(a._0, b._0)) return false;
      if (!__eq_Bytes(a._1, b._1)) return false;
      return true;
    }
    case "LinkClosed": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Register": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "Revoke": {
      if (!__eq_NodeCert$SignedRevocation(a._0, b._0)) return false;
      return true;
    }
    case "Unregister": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LocalDown": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "MoveReader": {
      if (a._0 !== b._0) return false;
      if (!__eq_CnLink(a._1, b._1)) return false;
      if (!__eq_List(a._2, b._2)) return false;
      if (!__eq_List(a._3, b._3)) return false;
      return true;
    }
    case "MoveTicker": {
      return true;
    }
    case "MoveAcceptor": {
      return true;
    }
    case "Shutdown": {
      return true;
    }
  }
  return true;
}

function __eq_ClusterNode__ClusterNodeActor_Actor(a, b) {
  if (a.$d_dispatch !== b.$d_dispatch) return false;
  if (a.$e_alive !== b.$e_alive) return false;
  if (!__eq_CnHandle(a.h, b.h)) return false;
  if (!__eq_CnState(a.st, b.st)) return false;
  if (a.started !== b.started) return false;
  return true;
}

function __eq_ClusterNode$NodeActorState(a, b) {
  if (!__eq_CnState(a.st, b.st)) return false;
  if (!__eq_CnHandle(a.h, b.h)) return false;
  if (a.started !== b.started) return false;
  return true;
}

function __eq_ClusterNode$ClusterOps(a, b) {
  if (a.node_id !== b.node_id) return false;
  if (a.stop !== b.stop) return false;
  if (a.subscribe !== b.subscribe) return false;
  if (a.unsubscribe !== b.unsubscribe) return false;
  if (a.members !== b.members) return false;
  if (a.all_members !== b.all_members) return false;
  if (a.addr_of !== b.addr_of) return false;
  if (a.name_of !== b.name_of) return false;
  if (a.link_count !== b.link_count) return false;
  if (a.register !== b.register) return false;
  if (a.unregister !== b.unregister) return false;
  if (a.lookup !== b.lookup) return false;
  if (a.registrant !== b.registrant) return false;
  if (a.names !== b.names) return false;
  if (a.watch !== b.watch) return false;
  if (a.unwatch !== b.unwatch) return false;
  if (a.stale_bindings !== b.stale_bindings) return false;
  if (a.creation !== b.creation) return false;
  if (a.next_id !== b.next_id) return false;
  if (a.queue_for !== b.queue_for) return false;
  if (a.session_queue_for !== b.session_queue_for) return false;
  if (a.send_msg !== b.send_msg) return false;
  if (a.route !== b.route) return false;
  if (a.route_type !== b.route_type) return false;
  if (a.route_session !== b.route_session) return false;
  if (a.unroute !== b.unroute) return false;
  if (a.on_peer_closed !== b.on_peer_closed) return false;
  if (a.off_peer_closed !== b.off_peer_closed) return false;
  if (a.on_delivery_failed !== b.on_delivery_failed) return false;
  if (a.on_session_failed !== b.on_session_failed) return false;
  if (a.off_session_failed !== b.off_session_failed) return false;
  if (a.monitor_remote !== b.monitor_remote) return false;
  if (a.demonitor_remote !== b.demonitor_remote) return false;
  if (a.peer_cert !== b.peer_cert) return false;
  if (a.own_cert !== b.own_cert) return false;
  if (a.frames_rejected !== b.frames_rejected) return false;
  if (a.raw_refused !== b.raw_refused) return false;
  if (a.revoke !== b.revoke) return false;
  if (a.revocations !== b.revocations) return false;
  if (a.replace_cert !== b.replace_cert) return false;
  if (a.on_security_event !== b.on_security_event) return false;
  if (a.off_security_event !== b.off_security_event) return false;
  if (a.registry_synced !== b.registry_synced) return false;
  if (a.rejoined_at !== b.rejoined_at) return false;
  if (a.attach_session !== b.attach_session) return false;
  if (a.handshake !== b.handshake) return false;
  return true;
}

function __eq_SessionNode$Link(a, b) {
  if (a.role !== b.role) return false;
  if (a.data_fd !== b.data_fd) return false;
  if (a.control_fd !== b.control_fd) return false;
  if (!__eq_GlobalPid$Pid(a.peer, b.peer)) return false;
  if (a.q !== b.q) return false;
  if (!__eq_Task(a.control, b.control)) return false;
  return true;
}

function __eq_SessionNode$EndpointState(a, b) {
  if (a.n !== b.n) return false;
  if (a.links !== b.links) return false;
  if (a.ended !== b.ended) return false;
  if (!__eq_List(a.failed, b.failed)) return false;
  if (!__eq_List(a.waiters, b.waiters)) return false;
  return true;
}

function __eq_SessionNode$Party(a, b) {
  if (a.my_role !== b.my_role) return false;
  if (a.node_id !== b.node_id) return false;
  if (!__eq_Vault(a.handlers, b.handlers)) return false;
  if (!__eq_Vault(a.waiting, b.waiting)) return false;
  if (!__eq_Vault(a.pending, b.pending)) return false;
  if (!__eq_Vault(a.meta, b.meta)) return false;
  if (!__eq_Vault(a.forward, b.forward)) return false;
  if (!__eq_Vault(a.why, b.why)) return false;
  if (!__eq_Vault(a.gone, b.gone)) return false;
  if (!__eq_Vault(a.cancel_hs, b.cancel_hs)) return false;
  if (!__eq_Vault(a.crash_hs, b.crash_hs)) return false;
  if (!__eq_Vault(a.forward_cancel, b.forward_cancel)) return false;
  if (!__eq_Vault(a.forward_crash, b.forward_crash)) return false;
  if (!__eq_Vault(a.heard, b.heard)) return false;
  if (!__eq_Vault(a.drain_hs, b.drain_hs)) return false;
  if (!__eq_Pid(a.ep, b.ep)) return false;
  if (!__eq_List(a.links, b.links)) return false;
  if (a.on_close !== b.on_close) return false;
  return true;
}

function __eq_SessionNode__HostWatch_State(a, b) {
  if (a.n !== b.n) return false;
  return true;
}

function __eq_SessionNode__HostWatch_Msg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Watch": {
      if (!__eq_Party(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_SessionNode__HostWatch_Actor(a, b) {
  if (a.$d_dispatch !== b.$d_dispatch) return false;
  if (a.$e_alive !== b.$e_alive) return false;
  if (a.n !== b.n) return false;
  return true;
}

function __eq_SessionNode__Endpoint_State(a, b) {
  if (a.ended !== b.ended) return false;
  if (!__eq_List(a.failed, b.failed)) return false;
  if (a.links !== b.links) return false;
  if (a.n !== b.n) return false;
  if (!__eq_List(a.waiters, b.waiters)) return false;
  return true;
}

function __eq_SessionNode__Endpoint_Msg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Deliver": {
      if (!__eq_Party(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_Bytes(a._3, b._3)) return false;
      return true;
    }
    case "AwaitOutcome": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Expect": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LinkEnded": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Drain": {
      if (!__eq_Party(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "PeerGone": {
      if (!__eq_Party(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "HostDown": {
      if (!__eq_Party(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "ReleaseEpoch": {
      return true;
    }
    case "Leave": {
      if (!__eq_Party(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "Early": {
      if (!__eq_Vault(a._0, b._0)) return false;
      if (!__eq_Party(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_Bytes(a._3, b._3)) return false;
      return true;
    }
    case "Ready": {
      if (!__eq_Party(a._0, b._0)) return false;
      return true;
    }
    case "DeliverDraining": {
      if (!__eq_Party(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_Bytes(a._3, b._3)) return false;
      return true;
    }
    case "Returned": {
      if (!__eq_Party(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_Bytes(a._2, b._2)) return false;
      return true;
    }
  }
  return true;
}

function __eq_SessionNode__Endpoint_Actor(a, b) {
  if (a.$d_dispatch !== b.$d_dispatch) return false;
  if (a.$e_alive !== b.$e_alive) return false;
  if (a.ended !== b.ended) return false;
  if (!__eq_List(a.failed, b.failed)) return false;
  if (a.links !== b.links) return false;
  if (a.n !== b.n) return false;
  if (!__eq_List(a.waiters, b.waiters)) return false;
  return true;
}

function __eq_SessionNode$EndpointReq(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DeliverReq": {
      return true;
    }
    case "OutcomeReq": {
      return true;
    }
  }
  return true;
}

function __eq_SessionNode$Addr(a, b) {
  if (a.role !== b.role) return false;
  if (a.host !== b.host) return false;
  if (a.port !== b.port) return false;
  return true;
}

function __eq_SessionNode$Addrs(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "List": {
      if (!__eq_Addr(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_SessionNode$RunError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Cancelled": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Protocol": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "HostGone": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Left": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Listen": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Accept": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Connect": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "NoOffer": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "AlreadyOffered": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Unauthorized": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_SessionNode$OfferCount(a, b) {
  if (a.active !== b.active) return false;
  return true;
}

function __eq_SessionNode$Offer(a, b) {
  if (!__eq_Cap(a.node, b.node)) return false;
  if (a.proto !== b.proto) return false;
  if (a.fingerprint !== b.fingerprint) return false;
  if (!__eq_List(a.roles, b.roles)) return false;
  if (!__eq_List(a.compat, b.compat)) return false;
  if (a.my_role !== b.my_role) return false;
  if (a.capacity !== b.capacity) return false;
  if (a.name !== b.name) return false;
  if (a.id !== b.id) return false;
  if (!__eq_Vault(a.flags, b.flags)) return false;
  if (!__eq_Vault(a.strs, b.strs)) return false;
  if (a.start !== b.start) return false;
  if (!__eq_Pid(a.worker, b.worker)) return false;
  return true;
}

function __eq_SessionNode__OfferActor_State(a, b) {
  if (a.active !== b.active) return false;
  return true;
}

function __eq_SessionNode__OfferActor_Msg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Invite": {
      if (!__eq_Offer(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_List(a._3, b._3)) return false;
      if (!__eq_GlobalPid$Pid(a._4, b._4)) return false;
      if (a._5 !== b._5) return false;
      if (a._6 !== b._6) return false;
      return true;
    }
    case "Withdraw": {
      if (!__eq_Offer(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Ended": {
      if (!__eq_Offer(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Close": {
      if (!__eq_Offer(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_SessionNode__OfferActor_Actor(a, b) {
  if (a.$d_dispatch !== b.$d_dispatch) return false;
  if (a.$e_alive !== b.$e_alive) return false;
  if (a.active !== b.active) return false;
  return true;
}

function __eq_SessionNode__ApInbox_State(a, b) {
  if (a.n !== b.n) return false;
  return true;
}

function __eq_SessionNode__ApInbox_Msg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Nop": {
      return true;
    }
  }
  return true;
}

function __eq_SessionNode__ApInbox_Actor(a, b) {
  if (a.$d_dispatch !== b.$d_dispatch) return false;
  if (a.$e_alive !== b.$e_alive) return false;
  if (a.n !== b.n) return false;
  return true;
}

function __eq_SessionNode$ApWait(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Answered": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "OfferGone": {
      return true;
    }
    case "NoAnswer": {
      return true;
    }
  }
  return true;
}

function __eq_SessionNode$ApMix(a, b) {
  if (a.fp !== b.fp) return false;
  if (!__eq_List(a.rows, b.rows)) return false;
  if (a.me !== b.me) return false;
  if (a.other !== b.other) return false;
  if (a.older !== b.older) return false;
  if (!__eq_List(a.filled, b.filled)) return false;
  return true;
}

function __eq_Topology$TopoPlacement(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PlaceEverywhere": {
      return true;
    }
    case "PlaceOn": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "PlaceCount": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "PlaceCountOn": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "PlaceNowhere": {
      return true;
    }
  }
  return true;
}

function __eq_Topology$TopoOpened(a, b) {
  if (!__eq_SessionNode$Offer(a.ap, b.ap)) return false;
  if (a.alive !== b.alive) return false;
  if (a.capacity !== b.capacity) return false;
  if (a.stop !== b.stop) return false;
  return true;
}

function __eq_Topology$TopoRole(a, b) {
  if (a.name !== b.name) return false;
  if (!__eq_TopoPlacement(a.place, b.place)) return false;
  if (a.capacity !== b.capacity) return false;
  if (a.pinned !== b.pinned) return false;
  if (a.open !== b.open) return false;
  return true;
}

function __eq_Topology$TopoAnchorState(a, b) {
  if (a.topology_anchor_marks !== b.topology_anchor_marks) return false;
  return true;
}

function __eq_Topology__Anchor_State(a, b) {
  if (a.topology_anchor_marks !== b.topology_anchor_marks) return false;
  return true;
}

function __eq_Topology__Anchor_Msg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Nop": {
      return true;
    }
    case "Respawn": {
      if (!__eq_Cap(a._0, b._0)) return false;
      if (!__eq_TopoState(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Topology__Anchor_Actor(a, b) {
  if (a.$d_dispatch !== b.$d_dispatch) return false;
  if (a.$e_alive !== b.$e_alive) return false;
  if (a.topology_anchor_marks !== b.topology_anchor_marks) return false;
  return true;
}

function __eq_Topology$TopoState(a, b) {
  if (!__eq_Vault(a.meta, b.meta)) return false;
  if (!__eq_Vault(a.strs, b.strs)) return false;
  if (!__eq_Vault(a.offers, b.offers)) return false;
  if (!__eq_Vault(a.draining, b.draining)) return false;
  if (!__eq_Vault(a.roles, b.roles)) return false;
  if (!__eq_Vault(a.anchor, b.anchor)) return false;
  return true;
}

function __eq_Topology$TopoDesired(a, b) {
  if (a.d_name !== b.d_name) return false;
  if (!__eq_TopoPlacement(a.d_place, b.d_place)) return false;
  if (a.d_capacity !== b.d_capacity) return false;
  return true;
}

function __eq_Control$CtlHosts(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HostsCanary": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "HostsRest": {
      return true;
    }
    case "HostsAll": {
      return true;
    }
  }
  return true;
}

function __eq_Control$CtlAction(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DoActivate": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "DoTopology": {
      return true;
    }
    case "DoDrain": {
      return true;
    }
    case "DoCerts": {
      return true;
    }
  }
  return true;
}

function __eq_Control$CtlGate(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "GateNone": {
      return true;
    }
    case "GateHealthy": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Control$CtlStep(a, b) {
  if (a.id !== b.id) return false;
  if (!__eq_List(a.pools, b.pools)) return false;
  if (!__eq_CtlHosts(a.hosts, b.hosts)) return false;
  if (!__eq_CtlAction(a.action, b.action)) return false;
  if (!__eq_CtlGate(a.gate, b.gate)) return false;
  if (a.batch !== b.batch) return false;
  return true;
}

function __eq_Control$CtlBuild(a, b) {
  if (a.name !== b.name) return false;
  if (a.base !== b.base) return false;
  if (a.manifest !== b.manifest) return false;
  return true;
}

function __eq_Control$CtlDrain(a, b) {
  if (a.epoch !== b.epoch) return false;
  if (a.soft_ms !== b.soft_ms) return false;
  if (a.hard_ms !== b.hard_ms) return false;
  return true;
}

function __eq_Control$CtlLine(a, b) {
  if (a.step !== b.step) return false;
  if (a.text !== b.text) return false;
  return true;
}

function __eq_Control$CtlCert(a, b) {
  if (a.node !== b.node) return false;
  if (a.cert !== b.cert) return false;
  return true;
}

function __eq_Control$CtlRelease(a, b) {
  if (a.seq !== b.seq) return false;
  if (a.parent !== b.parent) return false;
  if (a.env !== b.env) return false;
  if (a.topology !== b.topology) return false;
  if (!__eq_List(a.builds, b.builds)) return false;
  if (!__eq_List(a.steps, b.steps)) return false;
  if (!__eq_List(a.lines, b.lines)) return false;
  if (!__eq_List(a.certs, b.certs)) return false;
  if (!__eq_List(a.revokes, b.revokes)) return false;
  if (!__eq_Option(a.drain, b.drain)) return false;
  if (a.signature !== b.signature) return false;
  return true;
}

function __eq_Control$CtlMember(a, b) {
  if (a.node !== b.node) return false;
  if (!__eq_List(a.pools, b.pools)) return false;
  return true;
}

function __eq_Control$CtlVersion(a, b) {
  if (a.build !== b.build) return false;
  if (a.manifest !== b.manifest) return false;
  return true;
}

function __eq_Control$CtlFailure(a, b) {
  if (a.seq !== b.seq) return false;
  if (a.step !== b.step) return false;
  if (a.why !== b.why) return false;
  return true;
}

function __eq_Control$AgentReport(a, b) {
  if (a.node !== b.node) return false;
  if (a.seq !== b.seq) return false;
  if (a.versions !== b.versions) return false;
  if (a.topology !== b.topology) return false;
  if (a.drained !== b.drained) return false;
  if (a.healthy !== b.healthy) return false;
  if (a.failed_seq !== b.failed_seq) return false;
  if (a.failed_step !== b.failed_step) return false;
  if (a.failed_why !== b.failed_why) return false;
  if (a.detail !== b.detail) return false;
  if (a.pools !== b.pools) return false;
  if (a.certs !== b.certs) return false;
  return true;
}

function __eq_Control$StepOrder(a, b) {
  if (a.seq !== b.seq) return false;
  if (a.release !== b.release) return false;
  if (a.step !== b.step) return false;
  if (a.node !== b.node) return false;
  if (a.action !== b.action) return false;
  if (a.want !== b.want) return false;
  if (a.artifacts !== b.artifacts) return false;
  if (a.lines !== b.lines) return false;
  return true;
}

function __eq_Control$StepResult(a, b) {
  if (a.seq !== b.seq) return false;
  if (a.step !== b.step) return false;
  if (a.node !== b.node) return false;
  if (a.ok !== b.ok) return false;
  if (a.detail !== b.detail) return false;
  return true;
}

function __eq_Control$CtlObs(a, b) {
  if (!__eq_AgentReport(a.report, b.report)) return false;
  if (!__eq_Option(a.healthy_since, b.healthy_since)) return false;
  return true;
}

function __eq_Control$CtlDecision(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "RolloutApply": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "RolloutWait": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "RolloutHalted": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "RolloutComplete": {
      return true;
    }
    case "RolloutBehind": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Control$CtlLeader(a, b) {
  if (!__eq_Option(a.release, b.release)) return false;
  if (!__eq_List(a.obs, b.obs)) return false;
  if (!__eq_List(a.inflight, b.inflight)) return false;
  if (!__eq_Option(a.halted, b.halted)) return false;
  return true;
}

function __eq_Control$AgentOps(a, b) {
  if (a.report !== b.report) return false;
  if (a.has !== b.has) return false;
  if (a.request !== b.request) return false;
  return true;
}

function __eq_Control$CertOps(a, b) {
  if (a.name !== b.name) return false;
  if (!__eq_Bytes(a.deploy_key, b.deploy_key)) return false;
  if (a.serial !== b.serial) return false;
  if (a.replace !== b.replace) return false;
  if (a.revoke !== b.revoke) return false;
  if (a.floor !== b.floor) return false;
  return true;
}

function __eq_Control$CtlChunk(a, b) {
  if (a.offset !== b.offset) return false;
  if (a.data !== b.data) return false;
  if (a.last !== b.last) return false;
  return true;
}

function __eq_Control$CtlNext(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NextOrder": {
      if (!__eq_StepOrder(a._0, b._0)) return false;
      return true;
    }
    case "NextPoll": {
      return true;
    }
    case "NextBye": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Control$ControlOps(a, b) {
  if (a.report !== b.report) return false;
  if (a.stepped !== b.stepped) return false;
  if (a.next !== b.next) return false;
  if (a.head !== b.head) return false;
  return true;
}

function __eq_Js$Dom$Node(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
  }
  return true;
}

function __eq_Js$Dom$Event(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
  }
  return true;
}

function __eq_Js$Canvas$Context(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
  }
  return true;
}

function __eq_Js$Canvas$Image(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
  }
  return true;
}

function __eq_Js$Audio$Ctx(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
  }
  return true;
}

function __eq_Skee$App$Intent(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TapStart": {
      return true;
    }
    case "TapHowToPlay": {
      return true;
    }
    case "TapPickRoom": {
      if (!__eq_Room(a._0, b._0)) return false;
      return true;
    }
    case "TapOpenShop": {
      return true;
    }
    case "TapCloseShop": {
      return true;
    }
    case "TapBuyPrize": {
      if (!__eq_Prize(a._0, b._0)) return false;
      return true;
    }
    case "TapOpenGuide": {
      return true;
    }
    case "TapCloseGuide": {
      return true;
    }
    case "TapReplayLesson": {
      return true;
    }
    case "TapArrivalNext": {
      return true;
    }
    case "TapOpenHost": {
      return true;
    }
    case "TapCloseHost": {
      return true;
    }
    case "TapGotIt": {
      return true;
    }
    case "TapSkipWalkthrough": {
      return true;
    }
    case "TapPull": {
      return true;
    }
    case "TapSetBet": {
      if (!__eq_Bet(a._0, b._0)) return false;
      return true;
    }
    case "TapChooseBall": {
      if (!__eq_BallKind(a._0, b._0)) return false;
      return true;
    }
    case "TapArm": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TapSelectOffer": {
      if (!__eq_Option(a._0, b._0)) return false;
      return true;
    }
    case "TapBuyOffer": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TapReroll": {
      return true;
    }
    case "TapLeaveCounter": {
      return true;
    }
    case "TapCharm": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TapAskNewGame": {
      return true;
    }
    case "TapKeepPlaying": {
      return true;
    }
    case "TapNewRun": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$App$Msg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "MsgTick": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "MsgPointerDown": {
      if (!__eq_FlickSample(a._0, b._0)) return false;
      return true;
    }
    case "MsgPointerMove": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "MsgPointerUp": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "MsgPointerCancel": {
      return true;
    }
    case "MsgTap": {
      if (!__eq_Intent(a._0, b._0)) return false;
      return true;
    }
    case "MsgResize": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "MsgVisible": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "MsgAutoplay": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$App$SaveKey(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "KeyWallet": {
      return true;
    }
    case "KeyRun": {
      return true;
    }
    case "KeyTips": {
      return true;
    }
    case "KeyWalkthroughDone": {
      return true;
    }
    case "KeyArrivalDone": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$App$Impact(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ImpactLight": {
      return true;
    }
    case "ImpactHeavy": {
      return true;
    }
    case "ImpactRigid": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$App$Notice(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NoticeWarning": {
      return true;
    }
    case "NoticeError": {
      return true;
    }
    case "NoticeSuccess": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$App$Haptic(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HapticImpact": {
      if (!__eq_Impact(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "HapticNotify": {
      if (!__eq_Notice(a._0, b._0)) return false;
      return true;
    }
    case "HapticBuzz": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "HapticBuzzStop": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$App$Effect(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "FxSound": {
      if (!__eq_Skee$Synth$Sound(a._0, b._0)) return false;
      return true;
    }
    case "FxRumble": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "FxDrum": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "FxSave": {
      if (!__eq_SaveKey(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "FxHaptic": {
      if (!__eq_Haptic(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$App$SavedStrings(a, b) {
  if (!__eq_Option(a.saved_wallet, b.saved_wallet)) return false;
  if (!__eq_Option(a.saved_run, b.saved_run)) return false;
  if (!__eq_Option(a.saved_tips, b.saved_tips)) return false;
  if (!__eq_Option(a.saved_walk_done, b.saved_walk_done)) return false;
  if (!__eq_Option(a.saved_arrival_done, b.saved_arrival_done)) return false;
  return true;
}

function __eq_Skee$App$AfterHost(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ThenWalkthrough": {
      return true;
    }
    case "ThenNewGame": {
      return true;
    }
    case "ThenNothing": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$App$HostTable(a, b) {
  if (!__eq_Skee$Rooms$HostVisit(a.host_visit, b.host_visit)) return false;
  if (!__eq_Room(a.host_room, b.host_room)) return false;
  if (!__eq_AfterHost(a.host_after, b.host_after)) return false;
  return true;
}

function __eq_Skee$App$Parked(a, b) {
  if (!__eq_Skee$U64$U64(a.parked_seed, b.parked_seed)) return false;
  if (!__eq_List(a.parked_actions, b.parked_actions)) return false;
  if (!__eq_RunState(a.parked_run, b.parked_run)) return false;
  return true;
}

function __eq_Skee$App$TrailPoint(a, b) {
  if (a.trail_x !== b.trail_x) return false;
  if (a.trail_y !== b.trail_y) return false;
  if (a.trail_t !== b.trail_t) return false;
  return true;
}

function __eq_Skee$App$BallMark(a, b) {
  if (a.mark_along !== b.mark_along) return false;
  if (a.mark_t !== b.mark_t) return false;
  return true;
}

function __eq_Skee$App$Model(a, b) {
  if (!__eq_Skee$Consts$Consts(a.k, b.k)) return false;
  if (!__eq_Skee$World$World(a.world, b.world)) return false;
  if (!__eq_Skee$Rooms$CabinetPalette(a.palette, b.palette)) return false;
  if (!__eq_Skee$Camera$Rig(a.rig, b.rig)) return false;
  if (!__eq_Skee$Camera$Viewport(a.viewport, b.viewport)) return false;
  if (!__eq_Skee$Scene$Keep(a.keep, b.keep)) return false;
  if (!__eq_Skee$Scene$Scenery(a.scenery, b.scenery)) return false;
  if (!__eq_Skee$Presentation$Presentation(a.pres, b.pres)) return false;
  if (!__eq_RunState(a.run, b.run)) return false;
  if (!__eq_Skee$U64$U64(a.run_seed, b.run_seed)) return false;
  if (!__eq_List(a.actions_rev, b.actions_rev)) return false;
  if (!__eq_Tickets(a.extra, b.extra)) return false;
  if (!__eq_Wallet(a.wallet, b.wallet)) return false;
  if (!__eq_HudScreen(a.screen, b.screen)) return false;
  if (!__eq_Option(a.selected_offer, b.selected_offer)) return false;
  if (!__eq_Option(a.selected_charm, b.selected_charm)) return false;
  if (a.fold !== b.fold) return false;
  if (a.shop_open !== b.shop_open) return false;
  if (a.confirm_new !== b.confirm_new) return false;
  if (a.guide_open !== b.guide_open) return false;
  if (!__eq_Option(a.walk, b.walk)) return false;
  if (!__eq_Option(a.arrival, b.arrival)) return false;
  if (!__eq_TipTracker(a.tips, b.tips)) return false;
  if (!__eq_Option(a.parked, b.parked)) return false;
  if (a.walk_done !== b.walk_done) return false;
  if (a.arrival_done !== b.arrival_done) return false;
  if (!__eq_Option(a.host, b.host)) return false;
  if (!__eq_Bet(a.bet, b.bet)) return false;
  if (!__eq_List(a.autoplay, b.autoplay)) return false;
  if (!__eq_List(a.flick, b.flick)) return false;
  if (!__eq_List(a.trail, b.trail)) return false;
  if (a.line !== b.line) return false;
  if (a.aiming !== b.aiming) return false;
  if (!__eq_Option(a.held, b.held)) return false;
  if (!__eq_Option(a.last_render, b.last_render)) return false;
  if (a.now !== b.now) return false;
  if (!__eq_Option(a.last_ball, b.last_ball)) return false;
  if (a.rumble_sent !== b.rumble_sent) return false;
  if (a.drum_sent !== b.drum_sent) return false;
  if (!__eq_Option(a.buzz, b.buzz)) return false;
  if (!__eq_Skee$Rng$Rng(a.seeds, b.seeds)) return false;
  if (!__eq_List(a.out, b.out)) return false;
  return true;
}

function __eq_Skee$App$Layer(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LayerBase": {
      return true;
    }
    case "LayerCoachBlock": {
      return true;
    }
    case "LayerConfirmNew": {
      return true;
    }
    case "LayerShop": {
      return true;
    }
    case "LayerGuide": {
      return true;
    }
    case "LayerArrival": {
      return true;
    }
    case "LayerHost": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$App$TrailDot(a, b) {
  if (!__eq_ScreenPoint(a.dot, b.dot)) return false;
  if (a.dot_age !== b.dot_age) return false;
  return true;
}

function __eq_Skee$App$AppHud(a, b) {
  if (!__eq_HudState(a.app_hud, b.app_hud)) return false;
  if (!__eq_Wallet(a.app_wallet, b.app_wallet)) return false;
  if (!__eq_Option(a.coach, b.coach)) return false;
  if (a.shop_open_now !== b.shop_open_now) return false;
  if (a.confirm_new_now !== b.confirm_new_now) return false;
  if (a.guide_open_now !== b.guide_open_now) return false;
  if (!__eq_List(a.guide_topics, b.guide_topics)) return false;
  if (!__eq_Option(a.arrival_line, b.arrival_line)) return false;
  if (!__eq_List(a.known, b.known)) return false;
  if (!__eq_List(a.guide_line, b.guide_line)) return false;
  if (a.aiming_now !== b.aiming_now) return false;
  if (!__eq_List(a.trail_dots, b.trail_dots)) return false;
  if (!__eq_Layer(a.top, b.top)) return false;
  return true;
}

function __eq_Skee$App$Opening(a, b) {
  if (!__eq_RunState(a.open_run, b.open_run)) return false;
  if (!__eq_Skee$U64$U64(a.open_seed, b.open_seed)) return false;
  if (!__eq_Tickets(a.open_extra, b.open_extra)) return false;
  if (!__eq_List(a.open_actions, b.open_actions)) return false;
  if (!__eq_Wallet(a.open_wallet, b.open_wallet)) return false;
  if (!__eq_List(a.open_saves, b.open_saves)) return false;
  return true;
}

function __eq_Skee$App$Carry(a, b) {
  if (!__eq_Wallet(a.carry_wallet, b.carry_wallet)) return false;
  if (!__eq_List(a.carry_tips, b.carry_tips)) return false;
  if (a.carry_walk_done !== b.carry_walk_done) return false;
  if (a.carry_arrival_done !== b.carry_arrival_done) return false;
  if (!__eq_Skee$Camera$Viewport(a.carry_viewport, b.carry_viewport)) return false;
  if (!__eq_Skee$Rng$Rng(a.carry_seeds, b.carry_seeds)) return false;
  if (a.carry_now !== b.carry_now) return false;
  return true;
}

function __eq_Skee$Maths$Vec2(a, b) {
  if (a.x !== b.x) return false;
  if (a.y !== b.y) return false;
  return true;
}

function __eq_Skee$World$Vec3(a, b) {
  if (a.x !== b.x) return false;
  if (a.y !== b.y) return false;
  if (a.z !== b.z) return false;
  return true;
}

function __eq_Skee$World$World(a, b) {
  if (!__eq_Table(a.table, b.table)) return false;
  if (a.board_tilt !== b.board_tilt) return false;
  if (a.hump_height !== b.hump_height) return false;
  if (a.lane_scale !== b.lane_scale) return false;
  if (a.board_scale !== b.board_scale) return false;
  if (a.incline_sin !== b.incline_sin) return false;
  if (a.incline_cos !== b.incline_cos) return false;
  if (a.tilt_sin !== b.tilt_sin) return false;
  if (a.tilt_cos !== b.tilt_cos) return false;
  return true;
}

function __eq_Skee$Camera$Rig(a, b) {
  if (!__eq_Vec3(a.eye, b.eye)) return false;
  if (!__eq_Vec3(a.target, b.target)) return false;
  if (a.fov !== b.fov) return false;
  return true;
}

function __eq_Skee$Camera$Viewport(a, b) {
  if (a.width !== b.width) return false;
  if (a.height !== b.height) return false;
  return true;
}

function __eq_Skee$Camera$Framing(a, b) {
  if (!__eq_Vec3(a.near_point, b.near_point)) return false;
  if (!__eq_Vec3(a.hump_point, b.hump_point)) return false;
  if (!__eq_Vec3(a.top_point, b.top_point)) return false;
  return true;
}

function __eq_Skee$Camera$Lens(a, b) {
  if (!__eq_Vec3(a.eye, b.eye)) return false;
  if (!__eq_Vec3(a.forward, b.forward)) return false;
  if (!__eq_Vec3(a.right, b.right)) return false;
  if (!__eq_Vec3(a.up, b.up)) return false;
  if (a.tan_half !== b.tan_half) return false;
  if (a.aspect !== b.aspect) return false;
  if (a.width !== b.width) return false;
  if (a.height !== b.height) return false;
  return true;
}

function __eq_Skee$Camera$Seen(a, b) {
  if (a.across !== b.across) return false;
  if (a.rise !== b.rise) return false;
  if (a.depth !== b.depth) return false;
  return true;
}

function __eq_Skee$Camera$Sighting(a, b) {
  if (a.near_rise !== b.near_rise) return false;
  if (a.near_depth !== b.near_depth) return false;
  if (a.hump_rise !== b.hump_rise) return false;
  if (a.hump_depth !== b.hump_depth) return false;
  if (a.top_rise !== b.top_rise) return false;
  if (a.top_depth !== b.top_depth) return false;
  return true;
}

function __eq_Skee$Camera$Best(a, b) {
  if (a.err !== b.err) return false;
  if (a.fi !== b.fi) return false;
  if (a.hi !== b.hi) return false;
  if (a.zi !== b.zi) return false;
  if (a.li !== b.li) return false;
  return true;
}

function __eq_Skee$Consts$Consts(a, b) {
  if (a.pi !== b.pi) return false;
  if (a.tau !== b.tau) return false;
  if (a.dt !== b.dt) return false;
  if (a.unit53 !== b.unit53) return false;
  if (a.floor_u1 !== b.floor_u1) return false;
  if (a.infinity !== b.infinity) return false;
  if (a.nan !== b.nan) return false;
  if (a.marshmallow_drawn !== b.marshmallow_drawn) return false;
  return true;
}

function __eq_Skee$HudState$ScreenPoint(a, b) {
  if (a.sx !== b.sx) return false;
  if (a.sy !== b.sy) return false;
  return true;
}

function __eq_Skee$HudState$HudScreen(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TitleScreen": {
      return true;
    }
    case "GameScreen": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$HudState$HostSeam(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "HostClosed": {
      return true;
    }
    case "HostPlaceholder": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$HudState$Machine(a, b) {
  if (!__eq_Three(a.positions, b.positions)) return false;
  if (!__eq_Bet(a.machine_bet, b.machine_bet)) return false;
  if (!__eq_List(a.affordable, b.affordable)) return false;
  if (a.can_pull !== b.can_pull) return false;
  if (a.machine_free !== b.machine_free) return false;
  if (a.free_left !== b.free_left) return false;
  if (!__eq_List(a.wins, b.wins)) return false;
  if (a.machine_teasing !== b.machine_teasing) return false;
  if (!__eq_Room(a.machine_room, b.machine_room)) return false;
  if (!__eq_Progressive(a.machine_progressive, b.machine_progressive)) return false;
  if (a.show_bets !== b.show_bets) return false;
  return true;
}

function __eq_Skee$HudState$HudTally(a, b) {
  if (!__eq_Chips(a.tally_chips, b.tally_chips)) return false;
  if (a.tally_mult !== b.tally_mult) return false;
  if (a.label !== b.label) return false;
  return true;
}

function __eq_Skee$HudState$HudBanner(a, b) {
  if (a.title !== b.title) return false;
  if (a.sub !== b.sub) return false;
  if (a.progress !== b.progress) return false;
  return true;
}

function __eq_Skee$HudState$ScreenPopup(a, b) {
  if (a.screen_text !== b.screen_text) return false;
  if (!__eq_PopupKind(a.screen_kind, b.screen_kind)) return false;
  if (!__eq_ScreenPoint(a.at, b.at)) return false;
  if (a.screen_age !== b.screen_age) return false;
  return true;
}

function __eq_Skee$HudState$Hint(a, b) {
  if (a.hint_text !== b.hint_text) return false;
  if (!__eq_Option(a.hint_symbol, b.hint_symbol)) return false;
  if (a.after !== b.after) return false;
  if (a.hint_hot !== b.hint_hot) return false;
  return true;
}

function __eq_Skee$HudState$RunOver(a, b) {
  if (a.won !== b.won) return false;
  if (!__eq_RunStats(a.over_stats, b.over_stats)) return false;
  return true;
}

function __eq_Skee$HudState$TallyFold(a, b) {
  if (!__eq_Chips(a.folded_chips, b.folded_chips)) return false;
  if (a.folded_mult !== b.folded_mult) return false;
  return true;
}

function __eq_Skee$HudState$HudInputs(a, b) {
  if (!__eq_PerHole(a.hole_on_screen, b.hole_on_screen)) return false;
  if (!__eq_ScreenPoint(a.center, b.center)) return false;
  if (!__eq_Option(a.selected_offer, b.selected_offer)) return false;
  if (!__eq_Option(a.selected_charm, b.selected_charm)) return false;
  if (!__eq_HudScreen(a.screen, b.screen)) return false;
  if (!__eq_Bet(a.bet, b.bet)) return false;
  return true;
}

function __eq_Skee$HudState$HudState(a, b) {
  if (!__eq_HudScreen(a.hud_screen, b.hud_screen)) return false;
  if (a.hud_ante !== b.hud_ante) return false;
  if (a.antes !== b.antes) return false;
  if (a.round_title !== b.round_title) return false;
  if (a.is_boss !== b.is_boss) return false;
  if (a.boss_name !== b.boss_name) return false;
  if (a.boss_blurb !== b.boss_blurb) return false;
  if (!__eq_Points(a.score, b.score)) return false;
  if (!__eq_Points(a.hud_target, b.hud_target)) return false;
  if (!__eq_Tickets(a.hud_tickets, b.hud_tickets)) return false;
  if (a.hud_heat !== b.hud_heat) return false;
  if (a.heat_max !== b.heat_max) return false;
  if (a.hud_fever !== b.hud_fever) return false;
  if (!__eq_Three(a.targets, b.targets)) return false;
  if (a.hud_combo !== b.hud_combo) return false;
  if (!__eq_Option(a.machine, b.machine)) return false;
  if (!__eq_Three(a.frame, b.frame)) return false;
  if (a.frame_number !== b.frame_number) return false;
  if (a.frames_total !== b.frames_total) return false;
  if (a.balls_left !== b.balls_left) return false;
  if (!__eq_List(a.hud_charms, b.hud_charms)) return false;
  if (!__eq_List(a.hud_power_ups, b.hud_power_ups)) return false;
  if (!__eq_Option(a.hud_armed, b.hud_armed)) return false;
  if (!__eq_Option(a.counter, b.counter)) return false;
  if (!__eq_Option(a.over, b.over)) return false;
  if (!__eq_Option(a.tally, b.tally)) return false;
  if (!__eq_Option(a.hud_banner, b.hud_banner)) return false;
  if (!__eq_List(a.hud_popups, b.hud_popups)) return false;
  if (!__eq_Option(a.hud_selected_offer, b.hud_selected_offer)) return false;
  if (!__eq_Option(a.hud_selected_charm, b.hud_selected_charm)) return false;
  if (a.busy !== b.busy) return false;
  if (a.first_throw !== b.first_throw) return false;
  if (!__eq_Option(a.hint, b.hint)) return false;
  if (!__eq_List(a.throws_meter, b.throws_meter)) return false;
  if (!__eq_BallKind(a.hud_ball, b.hud_ball)) return false;
  if (a.rack !== b.rack) return false;
  if (!__eq_Option(a.hot_at, b.hot_at)) return false;
  if (a.hud_clock !== b.hud_clock) return false;
  if (a.shower !== b.shower) return false;
  if (!__eq_HostSeam(a.host, b.host)) return false;
  return true;
}

function __eq_Skee$HudView$Prop(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Prop": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$HudView$Html(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Tag": {
      if (a._0 !== b._0) return false;
      if (!__eq_List(a._1, b._1)) return false;
      if (!__eq_List(a._2, b._2)) return false;
      return true;
    }
    case "Words": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$HudView$HudAction(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ActIntent": {
      if (!__eq_Intent(a._0, b._0)) return false;
      return true;
    }
    case "ActTopic": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ActPageBack": {
      return true;
    }
    case "ActPageNext": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$HudView$GuideAt(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "GuideContents": {
      return true;
    }
    case "GuideReading": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$HudView$HudLocal(a, b) {
  if (!__eq_GuideAt(a.guide_at, b.guide_at)) return false;
  return true;
}

function __eq_Skee$HudView$Pane(a, b) {
  if (a.pane_id !== b.pane_id) return false;
  if (!__eq_Html(a.pane, b.pane)) return false;
  return true;
}

function __eq_Skee$HudView$OpenClip(a, b) {
  if (!__eq_List(a.before_rev, b.before_rev)) return false;
  if (a.clip_id !== b.clip_id) return false;
  if (!__eq_Shape(a.clip_shape, b.clip_shape)) return false;
  return true;
}

function __eq_Skee$HudView$Built(a, b) {
  if (!__eq_List(a.made_rev, b.made_rev)) return false;
  if (!__eq_List(a.open_clips, b.open_clips)) return false;
  if (!__eq_List(a.left, b.left)) return false;
  if (a.next_clip !== b.next_clip) return false;
  return true;
}

function __eq_Skee$HudView$PrizePen(a, b) {
  if (!__eq_Skee$Consts$Consts(a.k, b.k)) return false;
  if (a.silhouette !== b.silhouette) return false;
  if (a.prefix !== b.prefix) return false;
  return true;
}

function __eq_Skee$HudView$Seg(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SegMove": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "SegLine": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "SegQuad": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
    case "SegCubic": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      if (a._5 !== b._5) return false;
      return true;
    }
    case "SegArc": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "SegClose": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$HudView$Box(a, b) {
  if (a.bx0 !== b.bx0) return false;
  if (a.by0 !== b.by0) return false;
  if (a.bx1 !== b.bx1) return false;
  if (a.by1 !== b.by1) return false;
  return true;
}

function __eq_Skee$HudView$Section(a, b) {
  if (a.section_id !== b.section_id) return false;
  if (a.section_html !== b.section_html) return false;
  return true;
}

function __eq_Skee$Painter$FillRule(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "RuleNonZero": {
      return true;
    }
    case "RuleEvenOdd": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Painter$ColourStop(a, b) {
  if (a.stop_at !== b.stop_at) return false;
  if (a.stop_css !== b.stop_css) return false;
  return true;
}

function __eq_Skee$Painter$CanvasCall(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "CvSave": {
      return true;
    }
    case "CvRestore": {
      return true;
    }
    case "CvSetTransform": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      if (a._5 !== b._5) return false;
      return true;
    }
    case "CvComposite": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CvBeginPath": {
      return true;
    }
    case "CvMoveTo": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "CvLineTo": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "CvQuadTo": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
    case "CvCubicTo": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      if (a._5 !== b._5) return false;
      return true;
    }
    case "CvClosePath": {
      return true;
    }
    case "CvArc": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
    case "CvFillStyle": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CvRadialStyle": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      if (a._5 !== b._5) return false;
      if (!__eq_List(a._6, b._6)) return false;
      return true;
    }
    case "CvFill": {
      if (!__eq_FillRule(a._0, b._0)) return false;
      return true;
    }
    case "CvClip": {
      if (!__eq_FillRule(a._0, b._0)) return false;
      return true;
    }
    case "CvFillRect": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
    case "CvStrokeStyle": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CvLineWidth": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CvLineCap": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CvLineJoin": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CvStroke": {
      return true;
    }
    case "CvFont": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CvTextCentred": {
      return true;
    }
    case "CvFillText": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "CvStrokeText": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Painter$Painting(a, b) {
  if (!__eq_List(a.rev, b.rev)) return false;
  if (a.open_clips !== b.open_clips) return false;
  if (a.dpr !== b.dpr) return false;
  if (a.view_w !== b.view_w) return false;
  if (a.view_h !== b.view_h) return false;
  if (a.sweep !== b.sweep) return false;
  return true;
}

function __eq_Skee$Palette$Tint(a, b) {
  if (a.red !== b.red) return false;
  if (a.green !== b.green) return false;
  if (a.blue !== b.blue) return false;
  return true;
}

function __eq_Skee$Palette$ArtStyle(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Cel": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Three(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Three": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$PerHole(a, b) {
  if (a.gutter !== b.gutter) return false;
  if (a.ring10 !== b.ring10) return false;
  if (a.ring20 !== b.ring20) return false;
  if (a.ring30 !== b.ring30) return false;
  if (a.ring40 !== b.ring40) return false;
  if (a.ring50 !== b.ring50) return false;
  if (a.pocket_left !== b.pocket_left) return false;
  if (a.pocket_right !== b.pocket_right) return false;
  return true;
}

function __eq_Skee$Types$PerReel(a, b) {
  if (a.reel10 !== b.reel10) return false;
  if (a.reel20 !== b.reel20) return false;
  if (a.reel30 !== b.reel30) return false;
  if (a.reel40 !== b.reel40) return false;
  if (a.reel50 !== b.reel50) return false;
  if (a.reel_left !== b.reel_left) return false;
  if (a.reel_right !== b.reel_right) return false;
  return true;
}

function __eq_Skee$Types$PerRound(a, b) {
  if (a.warmup !== b.warmup) return false;
  if (a.feature !== b.feature) return false;
  if (a.boss_round !== b.boss_round) return false;
  return true;
}

function __eq_Skee$Types$PerTier(a, b) {
  if (a.mini !== b.mini) return false;
  if (a.minor !== b.minor) return false;
  if (a.major !== b.major) return false;
  if (a.grand !== b.grand) return false;
  return true;
}

function __eq_Skee$Types$PerRoom(a, b) {
  if (a.boardwalk !== b.boardwalk) return false;
  if (a.neon_lounge !== b.neon_lounge) return false;
  if (a.high_roller !== b.high_roller) return false;
  if (a.penthouse !== b.penthouse) return false;
  return true;
}

function __eq_Skee$Types$Chips(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Chips": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Points(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Points": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Tickets(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Tickets": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Winnings(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Winnings": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Hole(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Gutter": {
      return true;
    }
    case "Ring10": {
      return true;
    }
    case "Ring20": {
      return true;
    }
    case "Ring30": {
      return true;
    }
    case "Ring40": {
      return true;
    }
    case "Ring50": {
      return true;
    }
    case "PocketLeft": {
      return true;
    }
    case "PocketRight": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$ShotEvent(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ShotDud": {
      return true;
    }
    case "ShotRail": {
      return true;
    }
    case "ShotLaunched": {
      return true;
    }
    case "ShotLanded": {
      return true;
    }
    case "ShotLip": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "ShotBackwall": {
      return true;
    }
    case "ShotHop": {
      return true;
    }
    case "ShotDropped": {
      if (!__eq_Hole(a._0, b._0)) return false;
      return true;
    }
    case "ShotSettled": {
      if (!__eq_Hole(a._0, b._0)) return false;
      return true;
    }
    case "ShotGutter": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$TimedEvent(a, b) {
  if (!__eq_ShotEvent(a.event, b.event)) return false;
  if (a.at !== b.at) return false;
  return true;
}

function __eq_Skee$Types$PathPhase(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "OnLane": {
      return true;
    }
    case "InAir": {
      return true;
    }
    case "OnBoard": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$PathSample(a, b) {
  if (a.t !== b.t) return false;
  if (!__eq_PathPhase(a.phase, b.phase)) return false;
  if (a.px !== b.px) return false;
  if (a.along !== b.along) return false;
  if (a.height !== b.height) return false;
  return true;
}

function __eq_Skee$Types$Launch(a, b) {
  if (a.power !== b.power) return false;
  if (a.speed !== b.speed) return false;
  if (a.from !== b.from) return false;
  if (a.aim !== b.aim) return false;
  if (a.start !== b.start) return false;
  if (a.fold !== b.fold) return false;
  if (a.spin !== b.spin) return false;
  if (a.skid !== b.skid) return false;
  return true;
}

function __eq_Skee$Types$ShotResult(a, b) {
  if (!__eq_Launch(a.launch, b.launch)) return false;
  if (!__eq_Hole(a.hole, b.hole)) return false;
  if (!__eq_List(a.events, b.events)) return false;
  if (!__eq_List(a.path, b.path)) return false;
  if (!__eq_Option(a.hinge_speed, b.hinge_speed)) return false;
  if (!__eq_Option(a.first_landing, b.first_landing)) return false;
  if (a.peak_height !== b.peak_height) return false;
  if (a.duration !== b.duration) return false;
  return true;
}

function __eq_Skee$Types$LaneSpec(a, b) {
  if (a.length !== b.length) return false;
  if (a.width !== b.width) return false;
  if (a.incline !== b.incline) return false;
  if (a.rolling_friction !== b.rolling_friction) return false;
  if (a.rail_restitution !== b.rail_restitution) return false;
  if (a.min_speed !== b.min_speed) return false;
  if (a.scoring_speed !== b.scoring_speed) return false;
  if (a.max_speed !== b.max_speed) return false;
  if (a.knee !== b.knee) return false;
  if (a.max_aim_angle !== b.max_aim_angle) return false;
  if (a.hook !== b.hook) return false;
  if (a.skid_loss !== b.skid_loss) return false;
  return true;
}

function __eq_Skee$Types$HingeSpec(a, b) {
  if (a.base_angle !== b.base_angle) return false;
  if (a.fold_gain !== b.fold_gain) return false;
  if (a.carry !== b.carry) return false;
  return true;
}

function __eq_Skee$Types$Pocket(a, b) {
  if (!__eq_Hole(a.pocket_hole, b.pocket_hole)) return false;
  if (!__eq_Vec2(a.center, b.center)) return false;
  if (a.radius !== b.radius) return false;
  return true;
}

function __eq_Skee$Types$Pockets(a, b) {
  if (!__eq_Pocket(a.left, b.left)) return false;
  if (!__eq_Pocket(a.right, b.right)) return false;
  return true;
}

function __eq_Skee$Types$RingWalls(a, b) {
  if (a.wall40 !== b.wall40) return false;
  if (a.wall30 !== b.wall30) return false;
  if (a.wall20 !== b.wall20) return false;
  if (a.wall10 !== b.wall10) return false;
  return true;
}

function __eq_Skee$Types$BoardSpec(a, b) {
  if (a.board_width !== b.board_width) return false;
  if (a.board_height !== b.board_height) return false;
  if (a.tilt !== b.tilt) return false;
  if (!__eq_Vec2(a.ring_center, b.ring_center)) return false;
  if (!__eq_Vec2(a.center_hole_offset, b.center_hole_offset)) return false;
  if (a.center_hole_radius !== b.center_hole_radius) return false;
  if (a.capture_speed !== b.capture_speed) return false;
  if (a.pockets_need_flight !== b.pockets_need_flight) return false;
  if (a.lip_min_fall !== b.lip_min_fall) return false;
  if (!__eq_RingWalls(a.ring_walls, b.ring_walls)) return false;
  if (!__eq_Pockets(a.pockets, b.pockets)) return false;
  if (a.lip_height !== b.lip_height) return false;
  if (a.ball_radius !== b.ball_radius) return false;
  if (a.lip_band !== b.lip_band) return false;
  if (a.bounce !== b.bounce) return false;
  if (a.lip_bounce !== b.lip_bounce) return false;
  if (a.lip_kick !== b.lip_kick) return false;
  if (a.wall_restitution !== b.wall_restitution) return false;
  if (a.backwall_restitution !== b.backwall_restitution) return false;
  if (a.board_rolling_friction !== b.board_rolling_friction) return false;
  if (a.landing_grip !== b.landing_grip) return false;
  if (!__eq_Vec2(a.wind, b.wind)) return false;
  if (a.ring_hole_radius !== b.ring_hole_radius) return false;
  return true;
}

function __eq_Skee$Types$Table(a, b) {
  if (!__eq_LaneSpec(a.lane, b.lane)) return false;
  if (!__eq_HingeSpec(a.hinge, b.hinge)) return false;
  if (!__eq_BoardSpec(a.board, b.board)) return false;
  if (a.gravity !== b.gravity) return false;
  if (a.dt !== b.dt) return false;
  if (a.max_duration !== b.max_duration) return false;
  return true;
}

function __eq_Skee$Types$Symbol(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Blank": {
      return true;
    }
    case "Cherry": {
      return true;
    }
    case "Lemon": {
      return true;
    }
    case "Bell": {
      return true;
    }
    case "BarSym": {
      return true;
    }
    case "Seven": {
      return true;
    }
    case "Diamond": {
      return true;
    }
    case "Clover": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Payline(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NoLine": {
      return true;
    }
    case "Pair": {
      if (!__eq_Symbol(a._0, b._0)) return false;
      return true;
    }
    case "Triple": {
      if (!__eq_Symbol(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$ReelSymbol(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ReelCherry": {
      return true;
    }
    case "ReelLemon": {
      return true;
    }
    case "ReelBell": {
      return true;
    }
    case "ReelBar": {
      return true;
    }
    case "ReelSeven": {
      return true;
    }
    case "ReelDiamond": {
      return true;
    }
    case "ReelWild": {
      return true;
    }
    case "ReelX2": {
      return true;
    }
    case "ReelX3": {
      return true;
    }
    case "ReelBonus": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Bet(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "BetOne": {
      return true;
    }
    case "BetThree": {
      return true;
    }
    case "BetFive": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$JackpotTier(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Mini": {
      return true;
    }
    case "Minor": {
      return true;
    }
    case "Major": {
      return true;
    }
    case "Grand": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$LineWin(a, b) {
  if (a.line !== b.line) return false;
  if (!__eq_ReelSymbol(a.symbol, b.symbol)) return false;
  if (!__eq_Chips(a.line_chips, b.line_chips)) return false;
  if (a.multiplier !== b.multiplier) return false;
  return true;
}

function __eq_Skee$Types$Room(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Boardwalk": {
      return true;
    }
    case "NeonLounge": {
      return true;
    }
    case "HighRoller": {
      return true;
    }
    case "Penthouse": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Pull(a, b) {
  if (!__eq_Three(a.stops, b.stops)) return false;
  if (!__eq_Bet(a.bet, b.bet)) return false;
  if (a.free !== b.free) return false;
  if (!__eq_Room(a.pull_room, b.pull_room)) return false;
  return true;
}

function __eq_Skee$Types$Progressive(a, b) {
  if (!__eq_PerTier(a.meters, b.meters)) return false;
  return true;
}

function __eq_Skee$Types$BoardSetup(a, b) {
  if (!__eq_PerReel(a.reels, b.reels)) return false;
  if (!__eq_PerReel(a.gild, b.gild)) return false;
  return true;
}

function __eq_Skee$Types$TopSlot(a, b) {
  if (!__eq_Three(a.targets, b.targets)) return false;
  return true;
}

function __eq_Skee$Types$BallKind(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Marshmallow": {
      return true;
    }
    case "ClassicBall": {
      return true;
    }
    case "JumpingBean": {
      return true;
    }
    case "Wobbler": {
      return true;
    }
    case "Comet": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$BallRecord(a, b) {
  if (!__eq_Hole(a.record_hole, b.record_hole)) return false;
  if (!__eq_Symbol(a.record_symbol, b.record_symbol)) return false;
  if (!__eq_Chips(a.record_chips, b.record_chips)) return false;
  if (a.rattles !== b.rattles) return false;
  if (a.record_fold !== b.record_fold) return false;
  if (a.foul !== b.foul) return false;
  if (a.slot_hits !== b.slot_hits) return false;
  if (a.record_combo !== b.record_combo) return false;
  if (!__eq_BallKind(a.record_ball, b.record_ball)) return false;
  if (a.hot !== b.hot) return false;
  return true;
}

function __eq_Skee$Types$Charm(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "LuckyPenny": {
      return true;
    }
    case "HotStreak": {
      return true;
    }
    case "HeavyHand": {
      return true;
    }
    case "GutterRat": {
      return true;
    }
    case "EvenSteven": {
      return true;
    }
    case "Ladder": {
      return true;
    }
    case "CornerOffice": {
      return true;
    }
    case "NearMiss": {
      return true;
    }
    case "MultBall": {
      return true;
    }
    case "GlassCannon": {
      return true;
    }
    case "TicketMuncher": {
      return true;
    }
    case "HingeWhisperer": {
      return true;
    }
    case "BellRinger": {
      return true;
    }
    case "SevenSeas": {
      return true;
    }
    case "ExtraBall": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$ScoringContext(a, b) {
  if (!__eq_List(a.context_charms, b.context_charms)) return false;
  if (a.streak_before !== b.streak_before) return false;
  if (a.context_fever !== b.context_fever) return false;
  if (a.pairs_pay !== b.pairs_pay) return false;
  if (!__eq_Option(a.context_pull, b.context_pull)) return false;
  return true;
}

function __eq_Skee$Types$ScoreSource(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "FromBase": {
      return true;
    }
    case "FromPull": {
      return true;
    }
    case "FromBall": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "FromSlot": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "FromPayline": {
      return true;
    }
    case "FromCharm": {
      if (!__eq_Charm(a._0, b._0)) return false;
      return true;
    }
    case "FromFever": {
      return true;
    }
    case "FromFreeGame": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$ScoreEffect(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SetBase": {
      if (!__eq_Chips(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "AddChips": {
      if (!__eq_Chips(a._0, b._0)) return false;
      return true;
    }
    case "AddMult": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "TimesMult": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "AddTickets": {
      if (!__eq_Tickets(a._0, b._0)) return false;
      return true;
    }
    case "Note": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$ScoreStep(a, b) {
  if (!__eq_ScoreSource(a.source, b.source)) return false;
  if (!__eq_ScoreEffect(a.effect, b.effect)) return false;
  return true;
}

function __eq_Skee$Types$FrameScore(a, b) {
  if (!__eq_List(a.balls, b.balls)) return false;
  if (!__eq_Payline(a.payline, b.payline)) return false;
  if (!__eq_List(a.steps, b.steps)) return false;
  if (!__eq_Chips(a.frame_chips, b.frame_chips)) return false;
  if (a.mult !== b.mult) return false;
  if (!__eq_Tickets(a.frame_tickets, b.frame_tickets)) return false;
  if (a.streak_after !== b.streak_after) return false;
  return true;
}

function __eq_Skee$Types$FrameView(a, b) {
  if (!__eq_List(a.view_balls, b.view_balls)) return false;
  if (!__eq_Payline(a.view_payline, b.view_payline)) return false;
  if (a.view_streak_after !== b.view_streak_after) return false;
  return true;
}

function __eq_Skee$Types$PowerUp(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "GoldenBall": {
      return true;
    }
    case "Feather": {
      return true;
    }
    case "Magnet": {
      return true;
    }
    case "WildBall": {
      return true;
    }
    case "Hold": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Offer(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "OfferCharm": {
      if (!__eq_Charm(a._0, b._0)) return false;
      return true;
    }
    case "OfferStamp": {
      if (!__eq_Symbol(a._0, b._0)) return false;
      return true;
    }
    case "OfferGild": {
      return true;
    }
    case "OfferPurge": {
      return true;
    }
    case "OfferPowerUp": {
      if (!__eq_PowerUp(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$PrizeCounter(a, b) {
  if (!__eq_List(a.offers, b.offers)) return false;
  if (!__eq_Tickets(a.reroll_cost, b.reroll_cost)) return false;
  return true;
}

function __eq_Skee$Types$Boss(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TallLips": {
      return true;
    }
    case "SlickLane": {
      return true;
    }
    case "Crosswind": {
      return true;
    }
    case "Miser": {
      return true;
    }
    case "ShortHand": {
      return true;
    }
    case "TightPockets": {
      return true;
    }
    case "TheHouse": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$RoundKind(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Warmup": {
      return true;
    }
    case "Feature": {
      return true;
    }
    case "BossRound": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$RunConfig(a, b) {
  if (a.antes !== b.antes) return false;
  if (a.frames_per_round !== b.frames_per_round) return false;
  if (a.balls_per_frame !== b.balls_per_frame) return false;
  if (!__eq_Tickets(a.start_tickets, b.start_tickets)) return false;
  if (a.charm_slots !== b.charm_slots) return false;
  if (a.power_up_slots !== b.power_up_slots) return false;
  if (a.fever_heat !== b.fever_heat) return false;
  if (!__eq_List(a.ante_base, b.ante_base)) return false;
  if (a.target_scale !== b.target_scale) return false;
  if (!__eq_PerRound(a.kind_scale, b.kind_scale)) return false;
  if (!__eq_PerRound(a.round_tickets, b.round_tickets)) return false;
  if (a.overkill_step !== b.overkill_step) return false;
  if (a.overkill_cap !== b.overkill_cap) return false;
  if (a.interest_per !== b.interest_per) return false;
  if (a.interest_cap !== b.interest_cap) return false;
  if (a.offer_count !== b.offer_count) return false;
  return true;
}

function __eq_Skee$Types$RoundState(a, b) {
  if (!__eq_RoundKind(a.kind, b.kind)) return false;
  if (!__eq_Points(a.target, b.target)) return false;
  if (a.frames_total !== b.frames_total) return false;
  if (!__eq_List(a.frames, b.frames)) return false;
  if (!__eq_List(a.current_balls, b.current_balls)) return false;
  if (a.streak !== b.streak) return false;
  if (a.combo !== b.combo) return false;
  if (!__eq_Option(a.armed, b.armed)) return false;
  if (!__eq_Option(a.round_pull, b.round_pull)) return false;
  if (a.free_left !== b.free_left) return false;
  if (!__eq_Option(a.round_hot, b.round_hot)) return false;
  if (!__eq_Bet(a.last_bet, b.last_bet)) return false;
  return true;
}

function __eq_Skee$Types$Phase(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Throwing": {
      return true;
    }
    case "AtCounter": {
      if (!__eq_PrizeCounter(a._0, b._0)) return false;
      return true;
    }
    case "Lost": {
      return true;
    }
    case "Won": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$RunStats(a, b) {
  if (a.stat_balls !== b.stat_balls) return false;
  if (!__eq_PerHole(a.stat_holes, b.stat_holes)) return false;
  if (a.jackpots !== b.jackpots) return false;
  if (a.stat_rattles !== b.stat_rattles) return false;
  if (!__eq_Points(a.best_frame, b.best_frame)) return false;
  if (a.pulls !== b.pulls) return false;
  if (a.free_games !== b.free_games) return false;
  if (!__eq_PerTier(a.jackpot_tiers, b.jackpot_tiers)) return false;
  if (!__eq_Points(a.points, b.points)) return false;
  if (a.rounds_cleared !== b.rounds_cleared) return false;
  return true;
}

function __eq_Skee$Types$RunState(a, b) {
  if (!__eq_RunConfig(a.config, b.config)) return false;
  if (!__eq_BallKind(a.ball, b.ball)) return false;
  if (!__eq_Room(a.room, b.room)) return false;
  if (!__eq_Skee$Rng$Rng(a.rng, b.rng)) return false;
  if (!__eq_Skee$U64$U64(a.seed, b.seed)) return false;
  if (a.ante !== b.ante) return false;
  if (!__eq_Boss(a.boss, b.boss)) return false;
  if (!__eq_RoundState(a.round, b.round)) return false;
  if (!__eq_Phase(a.phase, b.phase)) return false;
  if (!__eq_BoardSetup(a.setup, b.setup)) return false;
  if (!__eq_PerReel(a.reel_stops, b.reel_stops)) return false;
  if (!__eq_TopSlot(a.top_slot, b.top_slot)) return false;
  if (!__eq_List(a.charms, b.charms)) return false;
  if (!__eq_List(a.power_ups, b.power_ups)) return false;
  if (!__eq_Tickets(a.tickets, b.tickets)) return false;
  if (a.heat !== b.heat) return false;
  if (a.fever !== b.fever) return false;
  if (!__eq_RunStats(a.stats, b.stats)) return false;
  return true;
}

function __eq_Skee$Types$Action(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PullLever": {
      if (!__eq_Bet(a._0, b._0)) return false;
      return true;
    }
    case "ThrowBall": {
      if (!__eq_Launch(a._0, b._0)) return false;
      return true;
    }
    case "CommitFoul": {
      return true;
    }
    case "ChooseBall": {
      if (!__eq_BallKind(a._0, b._0)) return false;
      return true;
    }
    case "Arm": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Buy": {
      if (a._0 !== b._0) return false;
      if (!__eq_Option(a._1, b._1)) return false;
      return true;
    }
    case "Reroll": {
      return true;
    }
    case "Sell": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "LeaveCounter": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$ActionError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "WrongPhase": {
      return true;
    }
    case "NoSuchOffer": {
      return true;
    }
    case "NoSuchItem": {
      return true;
    }
    case "CantAfford": {
      return true;
    }
    case "SlotsFull": {
      return true;
    }
    case "NeedsTarget": {
      return true;
    }
    case "AlreadyArmed": {
      return true;
    }
    case "ReelTooShort": {
      return true;
    }
    case "NeedsPull": {
      return true;
    }
    case "AlreadyPulled": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Payout(a, b) {
  if (!__eq_Tickets(a.base, b.base)) return false;
  if (!__eq_Tickets(a.overkill, b.overkill)) return false;
  if (!__eq_Tickets(a.interest, b.interest)) return false;
  return true;
}

function __eq_Skee$Types$GameEvent(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Pulled": {
      if (!__eq_Pull(a._0, b._0)) return false;
      return true;
    }
    case "FreeGamesWon": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "JackpotHit": {
      if (!__eq_JackpotTier(a._0, b._0)) return false;
      return true;
    }
    case "Shot": {
      if (!__eq_ShotResult(a._0, b._0)) return false;
      if (!__eq_BallRecord(a._1, b._1)) return false;
      return true;
    }
    case "Fouled": {
      return true;
    }
    case "FrameScored": {
      if (!__eq_FrameScore(a._0, b._0)) return false;
      return true;
    }
    case "FeverLit": {
      return true;
    }
    case "RoundCleared": {
      if (!__eq_Points(a._0, b._0)) return false;
      if (!__eq_Points(a._1, b._1)) return false;
      if (!__eq_Payout(a._2, b._2)) return false;
      return true;
    }
    case "RoundFailed": {
      if (!__eq_Points(a._0, b._0)) return false;
      if (!__eq_Points(a._1, b._1)) return false;
      return true;
    }
    case "CounterOpened": {
      return true;
    }
    case "Bought": {
      if (!__eq_Offer(a._0, b._0)) return false;
      return true;
    }
    case "Sold": {
      if (!__eq_Charm(a._0, b._0)) return false;
      return true;
    }
    case "Rerolled": {
      return true;
    }
    case "Armed": {
      if (!__eq_PowerUp(a._0, b._0)) return false;
      return true;
    }
    case "BallChosen": {
      if (!__eq_BallKind(a._0, b._0)) return false;
      return true;
    }
    case "RoundStarted": {
      if (!__eq_RoundKind(a._0, b._0)) return false;
      if (!__eq_Points(a._1, b._1)) return false;
      return true;
    }
    case "AnteStarted": {
      if (a._0 !== b._0) return false;
      if (!__eq_Boss(a._1, b._1)) return false;
      return true;
    }
    case "RunWon": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Step(a, b) {
  if (!__eq_RunState(a.run, b.run)) return false;
  if (!__eq_List(a.step_events, b.step_events)) return false;
  return true;
}

function __eq_Skee$Types$Prize(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Sticker": {
      return true;
    }
    case "RubberDuck": {
      return true;
    }
    case "Kazoo": {
      return true;
    }
    case "Yoyo": {
      return true;
    }
    case "Slinky": {
      return true;
    }
    case "PlushFrog": {
      return true;
    }
    case "LavaLamp": {
      return true;
    }
    case "Robot": {
      return true;
    }
    case "GiantBear": {
      return true;
    }
    case "Trophy": {
      return true;
    }
    case "GlowSticks": {
      return true;
    }
    case "RollerSkates": {
      return true;
    }
    case "DiscoBall": {
      return true;
    }
    case "NeonSign": {
      return true;
    }
    case "Jukebox": {
      return true;
    }
    case "ArcadeCabinet": {
      return true;
    }
    case "Cufflinks": {
      return true;
    }
    case "Champagne": {
      return true;
    }
    case "PearlNecklace": {
      return true;
    }
    case "GoldWatch": {
      return true;
    }
    case "Chandelier": {
      return true;
    }
    case "SportsCar": {
      return true;
    }
    case "GoldenFlamingo": {
      return true;
    }
    case "HotTub": {
      return true;
    }
    case "GrandPiano": {
      return true;
    }
    case "Yacht": {
      return true;
    }
    case "PrivateJet": {
      return true;
    }
    case "DiamondCrown": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$ShopError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ShopCantAfford": {
      return true;
    }
    case "AlreadyOwned": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$Comp(a, b) {
  if (!__eq_Room(a.comp_room, b.comp_room)) return false;
  if (a.nights !== b.nights) return false;
  if (!__eq_Tickets(a.comp_tickets, b.comp_tickets)) return false;
  if (!__eq_Winnings(a.credit, b.credit)) return false;
  return true;
}

function __eq_Skee$Types$Wallet(a, b) {
  if (!__eq_Winnings(a.balance, b.balance)) return false;
  if (!__eq_Winnings(a.lifetime, b.lifetime)) return false;
  if (!__eq_List(a.owned, b.owned)) return false;
  if (!__eq_Progressive(a.progressive, b.progressive)) return false;
  if (!__eq_PerRoom(a.rooms, b.rooms)) return false;
  if (!__eq_Room(a.wallet_room, b.wallet_room)) return false;
  if (!__eq_PerRoom(a.comps, b.comps)) return false;
  if (a.games_since_host !== b.games_since_host) return false;
  if (a.host_visits !== b.host_visits) return false;
  return true;
}

function __eq_Skee$Types$FlickSample(a, b) {
  if (a.sample_t !== b.sample_t) return false;
  if (a.sample_x !== b.sample_x) return false;
  if (a.sample_y !== b.sample_y) return false;
  return true;
}

function __eq_Skee$Types$FlickGeometry(a, b) {
  if (a.crease_y !== b.crease_y) return false;
  if (a.lane_center_x !== b.lane_center_x) return false;
  if (a.lane_half_width !== b.lane_half_width) return false;
  if (a.foul_give !== b.foul_give) return false;
  return true;
}

function __eq_Skee$Types$StrokeOutcome(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NoThrow": {
      return true;
    }
    case "StrokeFoul": {
      return true;
    }
    case "Release": {
      if (!__eq_Launch(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$FlickTuning(a, b) {
  if (a.slowest !== b.slowest) return false;
  if (a.fastest !== b.fastest) return false;
  if (a.release_weight !== b.release_weight) return false;
  if (a.snap_gain !== b.snap_gain) return false;
  if (a.full_aim_angle !== b.full_aim_angle) return false;
  if (a.smooth_jerk !== b.smooth_jerk) return false;
  if (a.skid_per_jerk !== b.skid_per_jerk) return false;
  if (a.line_reach !== b.line_reach) return false;
  return true;
}

function __eq_Skee$Types$Skill(a, b) {
  if (a.skill_name !== b.skill_name) return false;
  if (a.power_sigma !== b.power_sigma) return false;
  if (a.aim_sigma !== b.aim_sigma) return false;
  return true;
}

function __eq_Skee$Types$WalkthroughStep(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "WalkWelcome": {
      return true;
    }
    case "WalkPull": {
      return true;
    }
    case "WalkFlick": {
      return true;
    }
    case "WalkSymbols": {
      return true;
    }
    case "WalkLine": {
      return true;
    }
    case "WalkScore": {
      return true;
    }
    case "WalkPullAgain": {
      return true;
    }
    case "WalkTopSlot": {
      return true;
    }
    case "WalkLastPull": {
      return true;
    }
    case "WalkFinish": {
      return true;
    }
    case "WalkCounter": {
      return true;
    }
    case "WalkPrizes": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$CoachCard(a, b) {
  if (a.coach_title !== b.coach_title) return false;
  if (a.coach_body !== b.coach_body) return false;
  if (a.coach_needs_tap !== b.coach_needs_tap) return false;
  if (a.coach_high !== b.coach_high) return false;
  return true;
}

function __eq_Skee$Types$Walkthrough(a, b) {
  if (!__eq_WalkthroughStep(a.walk_step, b.walk_step)) return false;
  if (a.walk_finished !== b.walk_finished) return false;
  if (a.walk_last_foul !== b.walk_last_foul) return false;
  if (a.walk_pulled_ahead !== b.walk_pulled_ahead) return false;
  return true;
}

function __eq_Skee$Types$Tip(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TipCombo": {
      return true;
    }
    case "TipHotSpot": {
      return true;
    }
    case "TipCharm": {
      return true;
    }
    case "TipSpecialty": {
      return true;
    }
    case "TipBoardEdit": {
      return true;
    }
    case "TipBoss": {
      return true;
    }
    case "TipBets": {
      return true;
    }
    case "TipBalls": {
      return true;
    }
    case "TipFever": {
      return true;
    }
    case "TipFreeGames": {
      return true;
    }
    case "TipJackpot": {
      return true;
    }
    case "TipGameOver": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$SinceTip(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NoTipYet": {
      return true;
    }
    case "BallsSince": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Types$TipTracker(a, b) {
  if (!__eq_List(a.tips_seen, b.tips_seen)) return false;
  if (!__eq_SinceTip(a.since_tip, b.since_tip)) return false;
  if (!__eq_Option(a.tip_showing, b.tip_showing)) return false;
  return true;
}

function __eq_Skee$Types$GuideTopic(a, b) {
  if (a.topic_title !== b.topic_title) return false;
  if (!__eq_List(a.topic_pages, b.topic_pages)) return false;
  if (!__eq_List(a.topic_unlocks, b.topic_unlocks)) return false;
  return true;
}

function __eq_Skee$Physics$SavedLaunch(a, b) {
  if (a.saved_power !== b.saved_power) return false;
  if (a.saved_aim !== b.saved_aim) return false;
  if (!__eq_Option(a.saved_start, b.saved_start)) return false;
  if (!__eq_Option(a.saved_fold, b.saved_fold)) return false;
  if (!__eq_Option(a.saved_spin, b.saved_spin)) return false;
  if (!__eq_Option(a.saved_skid, b.saved_skid)) return false;
  if (!__eq_Option(a.saved_speed, b.saved_speed)) return false;
  if (!__eq_Option(a.saved_from, b.saved_from)) return false;
  return true;
}

function __eq_Skee$Physics$SinCos(a, b) {
  if (a.sine !== b.sine) return false;
  if (a.cosine !== b.cosine) return false;
  return true;
}

function __eq_Skee$Physics$SineBook(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "NoSines": {
      return true;
    }
    case "SineNode": {
      if (!__eq_SineBook(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_SineBook(a._3, b._3)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Physics$ShotTrig(a, b) {
  if (!__eq_SinCos(a.aim_angle, b.aim_angle)) return false;
  if (!__eq_SinCos(a.incline, b.incline)) return false;
  if (!__eq_SinCos(a.tilt, b.tilt)) return false;
  if (!__eq_SinCos(a.hinge_angle, b.hinge_angle)) return false;
  if (!__eq_SineBook(a.sines, b.sines)) return false;
  return true;
}

function __eq_Skee$Physics$ShotSetup(a, b) {
  if (!__eq_Skee$Consts$Consts(a.k, b.k)) return false;
  if (!__eq_ShotTrig(a.trig, b.trig)) return false;
  if (!__eq_Launch(a.throw, b.throw)) return false;
  if (!__eq_Table(a.table, b.table)) return false;
  if (!__eq_BallKind(a.ball, b.ball)) return false;
  if (a.half_lane !== b.half_lane) return false;
  if (a.hook_pull !== b.hook_pull) return false;
  if (a.slope_pull !== b.slope_pull) return false;
  if (a.lane_friction !== b.lane_friction) return false;
  if (!__eq_Vec2(a.in_plane, b.in_plane)) return false;
  if (a.normal_pull !== b.normal_pull) return false;
  if (a.half_board !== b.half_board) return false;
  if (a.back !== b.back) return false;
  if (!__eq_List(a.walls, b.walls)) return false;
  return true;
}

function __eq_Skee$Physics$ShotSim(a, b) {
  if (a.t !== b.t) return false;
  if (a.step !== b.step) return false;
  if (!__eq_List(a.events, b.events)) return false;
  if (!__eq_List(a.path, b.path)) return false;
  if (!__eq_Option(a.hinge_speed, b.hinge_speed)) return false;
  if (!__eq_Option(a.first_landing, b.first_landing)) return false;
  if (a.peak !== b.peak) return false;
  if (a.touched_wall !== b.touched_wall) return false;
  if (!__eq_Skee$Rng$Rng(a.rng, b.rng)) return false;
  if (a.next_hop !== b.next_hop) return false;
  if (a.hop_until !== b.hop_until) return false;
  if (a.hops !== b.hops) return false;
  if (a.sway_phase !== b.sway_phase) return false;
  return true;
}

function __eq_Skee$Physics$LaneBall(a, b) {
  if (a.lx !== b.lx) return false;
  if (a.ls !== b.ls) return false;
  if (a.lvx !== b.lvx) return false;
  if (a.lvs !== b.lvs) return false;
  if (a.dud !== b.dud) return false;
  return true;
}

function __eq_Skee$Physics$BoardMode(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "BallAirborne": {
      return true;
    }
    case "BallRolling": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Physics$BoardBall(a, b) {
  if (!__eq_Vec2(a.p, b.p)) return false;
  if (!__eq_Vec2(a.v, b.v)) return false;
  if (a.z !== b.z) return false;
  if (a.vz !== b.vz) return false;
  if (!__eq_BoardMode(a.mode, b.mode)) return false;
  if (a.resting !== b.resting) return false;
  if (a.nudges !== b.nudges) return false;
  return true;
}

function __eq_Skee$Physics$BoardTurn(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "KeepGoing": {
      if (!__eq_ShotSim(a._0, b._0)) return false;
      if (!__eq_BoardBall(a._1, b._1)) return false;
      return true;
    }
    case "StopHere": {
      if (!__eq_ShotSim(a._0, b._0)) return false;
      if (!__eq_BoardBall(a._1, b._1)) return false;
      return true;
    }
    case "ShotOver": {
      if (!__eq_ShotResult(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Presentation$Beat(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "BeatRoll": {
      if (!__eq_ShotResult(a._0, b._0)) return false;
      if (!__eq_BallRecord(a._1, b._1)) return false;
      return true;
    }
    case "BeatSpin": {
      if (!__eq_PerReel(a._0, b._0)) return false;
      return true;
    }
    case "BeatPull": {
      if (!__eq_Pull(a._0, b._0)) return false;
      return true;
    }
    case "BeatTally": {
      if (!__eq_FrameScore(a._0, b._0)) return false;
      return true;
    }
    case "BeatBanner": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
    case "BeatCommit": {
      if (!__eq_RunState(a._0, b._0)) return false;
      return true;
    }
    case "BeatRestyle": {
      if (!__eq_ArtStyle(a._0, b._0)) return false;
      if (!__eq_ArtStyle(a._1, b._1)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Presentation$Cue(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "CueLaunch": {
      return true;
    }
    case "CueRail": {
      return true;
    }
    case "CueHump": {
      return true;
    }
    case "CueLip": {
      return true;
    }
    case "CueBackwall": {
      return true;
    }
    case "CueLanded": {
      return true;
    }
    case "CueDrop": {
      if (!__eq_Hole(a._0, b._0)) return false;
      return true;
    }
    case "CueGutter": {
      return true;
    }
    case "CueHop": {
      return true;
    }
    case "CueWhoosh": {
      return true;
    }
    case "CueHotSpot": {
      return true;
    }
    case "CueLever": {
      return true;
    }
    case "CuePullWin": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CueReelTick": {
      return true;
    }
    case "CueReelStop": {
      return true;
    }
    case "CueCombo": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CueTallyChips": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CueTallyMult": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CueFrameDone": {
      return true;
    }
    case "CueLineWon": {
      return true;
    }
    case "CueJackpot": {
      return true;
    }
    case "CueBanner": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CueFoul": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Presentation$ThrowMark(a, b) {
  if (a.mark_power !== b.mark_power) return false;
  if (!__eq_Hole(a.mark_hole, b.mark_hole)) return false;
  return true;
}

function __eq_Skee$Presentation$PopupAnchor(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "AnchorHole": {
      if (!__eq_Hole(a._0, b._0)) return false;
      return true;
    }
    case "AnchorCenter": {
      return true;
    }
    case "AnchorHud": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Presentation$PopupKind(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "PopupChips": {
      return true;
    }
    case "PopupMult": {
      return true;
    }
    case "PopupTickets": {
      return true;
    }
    case "PopupBad": {
      return true;
    }
    case "PopupJackpot": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Presentation$Popup(a, b) {
  if (a.popup_text !== b.popup_text) return false;
  if (!__eq_PopupAnchor(a.anchor, b.anchor)) return false;
  if (!__eq_PopupKind(a.popup_kind, b.popup_kind)) return false;
  if (a.life !== b.life) return false;
  if (a.age !== b.age) return false;
  return true;
}

function __eq_Skee$Presentation$RestingBall(a, b) {
  if (!__eq_PathSample(a.rest_sample, b.rest_sample)) return false;
  if (a.until !== b.until) return false;
  return true;
}

function __eq_Skee$Presentation$Presentation(a, b) {
  if (!__eq_RunState(a.shown, b.shown)) return false;
  if (!__eq_List(a.beats, b.beats)) return false;
  if (a.beat_time !== b.beat_time) return false;
  if (a.clock !== b.clock) return false;
  if (!__eq_PerReel(a.reel_positions, b.reel_positions)) return false;
  if (!__eq_PerReel(a.spin_from, b.spin_from)) return false;
  if (!__eq_Three(a.pull_positions, b.pull_positions)) return false;
  if (!__eq_Three(a.pull_from, b.pull_from)) return false;
  if (a.pull_stopped !== b.pull_stopped) return false;
  if (!__eq_Option(a.last_pull, b.last_pull)) return false;
  if (!__eq_List(a.popups, b.popups)) return false;
  if (!__eq_List(a.trail, b.trail)) return false;
  if (a.flash !== b.flash) return false;
  if (a.shake !== b.shake) return false;
  if (a.celebration !== b.celebration) return false;
  if (!__eq_Option(a.resting_ball, b.resting_ball)) return false;
  if (!__eq_ArtStyle(a.style, b.style)) return false;
  if (!__eq_List(a.recent_throws, b.recent_throws)) return false;
  if (!__eq_Points(a.tallied_bonus, b.tallied_bonus)) return false;
  if (!__eq_List(a.finished, b.finished)) return false;
  if (!__eq_List(a.cues, b.cues)) return false;
  if (a.last_tick !== b.last_tick) return false;
  if (a.shown_steps !== b.shown_steps) return false;
  return true;
}

function __eq_Skee$Presentation$Restyling(a, b) {
  if (!__eq_ArtStyle(a.restyle_from, b.restyle_from)) return false;
  if (!__eq_ArtStyle(a.restyle_to, b.restyle_to)) return false;
  if (a.restyle_progress !== b.restyle_progress) return false;
  return true;
}

function __eq_Skee$Presentation$TallyShown(a, b) {
  if (!__eq_FrameScore(a.tally_frame, b.tally_frame)) return false;
  if (a.revealed !== b.revealed) return false;
  return true;
}

function __eq_Skee$Presentation$BannerShown(a, b) {
  if (a.banner_title !== b.banner_title) return false;
  if (a.banner_sub !== b.banner_sub) return false;
  if (a.banner_progress !== b.banner_progress) return false;
  return true;
}

function __eq_Skee$U64$U64(a, b) {
  if (a.hi !== b.hi) return false;
  if (a.lo !== b.lo) return false;
  return true;
}

function __eq_Skee$Rng$Rng(a, b) {
  if (!__eq_U64(a.word, b.word)) return false;
  return true;
}

function __eq_Skee$Rooms$HostVisit(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "VisitArrival": {
      return true;
    }
    case "VisitNewRoom": {
      return true;
    }
    case "VisitReturning": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Rooms$Rgb(a, b) {
  if (a.packed !== b.packed) return false;
  return true;
}

function __eq_Skee$Rooms$ZoneColours(a, b) {
  if (!__eq_Rgb(a.zone40, b.zone40)) return false;
  if (!__eq_Rgb(a.zone30, b.zone30)) return false;
  if (!__eq_Rgb(a.zone20, b.zone20)) return false;
  if (!__eq_Rgb(a.zone10, b.zone10)) return false;
  return true;
}

function __eq_Skee$Rooms$CabinetPalette(a, b) {
  if (!__eq_Rgb(a.backdrop, b.backdrop)) return false;
  if (!__eq_Rgb(a.rail, b.rail)) return false;
  if (!__eq_Rgb(a.rail_dark, b.rail_dark)) return false;
  if (!__eq_Rgb(a.cabinet_body, b.cabinet_body)) return false;
  if (!__eq_ZoneColours(a.zones, b.zones)) return false;
  if (!__eq_Rgb(a.lip, b.lip)) return false;
  if (!__eq_Rgb(a.hole_colour, b.hole_colour)) return false;
  if (!__eq_Rgb(a.felt, b.felt)) return false;
  if (!__eq_Rgb(a.floor, b.floor)) return false;
  return true;
}

function __eq_Skee$Save$SaveError(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SaveNotJson": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SaveTooDeep": {
      return true;
    }
    case "SaveMissing": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SaveWrongType": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SaveUnknownName": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "SaveOutOfRange": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Save$RunFile(a, b) {
  if (!__eq_Skee$U64$U64(a.file_seed, b.file_seed)) return false;
  if (!__eq_Option(a.file_room, b.file_room)) return false;
  if (!__eq_Option(a.file_extra, b.file_extra)) return false;
  if (!__eq_List(a.file_actions, b.file_actions)) return false;
  return true;
}

function __eq_Skee$Save$Replayed(a, b) {
  if (!__eq_RunState(a.replayed_run, b.replayed_run)) return false;
  if (!__eq_Skee$U64$U64(a.replayed_seed, b.replayed_seed)) return false;
  if (!__eq_Tickets(a.replayed_extra, b.replayed_extra)) return false;
  if (!__eq_List(a.replayed_actions, b.replayed_actions)) return false;
  return true;
}

function __eq_Skee$Save$StartedRun(a, b) {
  if (!__eq_RunState(a.started_run, b.started_run)) return false;
  if (!__eq_RunFile(a.started_file, b.started_file)) return false;
  if (!__eq_Wallet(a.started_wallet, b.started_wallet)) return false;
  return true;
}

function __eq_Skee$Save$JsonWant(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "WantTop": {
      return true;
    }
    case "WantEnd": {
      return true;
    }
    case "WantArrayValue": {
      return true;
    }
    case "WantKey": {
      return true;
    }
    case "WantColon": {
      return true;
    }
    case "WantObjectValue": {
      return true;
    }
    case "WantAfter": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Save$JsonScan(a, b) {
  if (a.scan_at !== b.scan_at) return false;
  if (!__eq_JsonWant(a.want, b.want)) return false;
  if (!__eq_List(a.open, b.open)) return false;
  if (a.depth !== b.depth) return false;
  if (a.pruned_at !== b.pruned_at) return false;
  if (!__eq_List(a.pieces, b.pieces)) return false;
  if (a.copy_from !== b.copy_from) return false;
  if (a.comma !== b.comma) return false;
  return true;
}

function __eq_Skee$Scene$Rgba(a, b) {
  if (a.red !== b.red) return false;
  if (a.green !== b.green) return false;
  if (a.blue !== b.blue) return false;
  if (a.alpha !== b.alpha) return false;
  return true;
}

function __eq_Skee$Scene$LineEnd(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ButtEnd": {
      return true;
    }
    case "RoundEnd": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Corner(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "MitreCorner": {
      return true;
    }
    case "RoundCorner": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Blend(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Over": {
      return true;
    }
    case "Lighter": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$PathStep(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "MoveTo": {
      if (!__eq_Vec2(a._0, b._0)) return false;
      return true;
    }
    case "LineTo": {
      if (!__eq_Vec2(a._0, b._0)) return false;
      return true;
    }
    case "QuadTo": {
      if (!__eq_Vec2(a._0, b._0)) return false;
      if (!__eq_Vec2(a._1, b._1)) return false;
      return true;
    }
    case "CubicTo": {
      if (!__eq_Vec2(a._0, b._0)) return false;
      if (!__eq_Vec2(a._1, b._1)) return false;
      if (!__eq_Vec2(a._2, b._2)) return false;
      return true;
    }
    case "ClosePath": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Shape(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Poly": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "Holed": {
      if (!__eq_List(a._0, b._0)) return false;
      if (!__eq_List(a._1, b._1)) return false;
      return true;
    }
    case "Polys": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
    case "Disc": {
      if (!__eq_Vec2(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Outline": {
      if (!__eq_List(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Affine(a, b) {
  if (a.a !== b.a) return false;
  if (a.b !== b.b) return false;
  if (a.c !== b.c) return false;
  if (a.d !== b.d) return false;
  if (a.e !== b.e) return false;
  if (a.f !== b.f) return false;
  return true;
}

function __eq_Skee$Scene$GradientStop(a, b) {
  if (a.offset !== b.offset) return false;
  if (!__eq_Rgba(a.colour, b.colour)) return false;
  return true;
}

function __eq_Skee$Scene$Radial(a, b) {
  if (!__eq_Vec2(a.inner, b.inner)) return false;
  if (a.inner_radius !== b.inner_radius) return false;
  if (!__eq_Vec2(a.outer, b.outer)) return false;
  if (a.outer_radius !== b.outer_radius) return false;
  if (!__eq_List(a.stops, b.stops)) return false;
  if (!__eq_Affine(a.frame, b.frame)) return false;
  return true;
}

function __eq_Skee$Scene$Paint(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Flat": {
      if (!__eq_Rgba(a._0, b._0)) return false;
      return true;
    }
    case "RadialPaint": {
      if (!__eq_Radial(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Pen(a, b) {
  if (!__eq_Rgba(a.ink, b.ink)) return false;
  if (a.width !== b.width) return false;
  if (!__eq_LineEnd(a.ends, b.ends)) return false;
  if (!__eq_Corner(a.corners, b.corners)) return false;
  return true;
}

function __eq_Skee$Scene$Lettering(a, b) {
  if (a.words !== b.words) return false;
  if (a.font !== b.font) return false;
  if (!__eq_Vec2(a.middle, b.middle)) return false;
  if (!__eq_Rgba(a.fill, b.fill)) return false;
  if (!__eq_Option(a.edge, b.edge)) return false;
  if (!__eq_Affine(a.frame, b.frame)) return false;
  return true;
}

function __eq_Skee$Scene$DrawOp(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "ClearTo": {
      if (!__eq_Rgba(a._0, b._0)) return false;
      return true;
    }
    case "FillShape": {
      if (!__eq_Shape(a._0, b._0)) return false;
      if (!__eq_Paint(a._1, b._1)) return false;
      if (!__eq_Blend(a._2, b._2)) return false;
      return true;
    }
    case "StrokeShape": {
      if (!__eq_Shape(a._0, b._0)) return false;
      if (!__eq_Pen(a._1, b._1)) return false;
      if (!__eq_Blend(a._2, b._2)) return false;
      return true;
    }
    case "DrawText": {
      if (!__eq_Lettering(a._0, b._0)) return false;
      return true;
    }
    case "PushClip": {
      if (!__eq_Shape(a._0, b._0)) return false;
      return true;
    }
    case "PopClip": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Frame(a, b) {
  if (!__eq_Vec3(a.ax, b.ax)) return false;
  if (!__eq_Vec3(a.ay, b.ay)) return false;
  if (!__eq_Vec3(a.az, b.az)) return false;
  if (!__eq_Vec3(a.at, b.at)) return false;
  return true;
}

function __eq_Skee$Scene$Solid(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Slab": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      return true;
    }
    case "Drum": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Orb": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "Hoop": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Card": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "Band": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "LipArc": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (a._3 !== b._3) return false;
      if (a._4 !== b._4) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Skin(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Painted": {
      return true;
    }
    case "LaneWood": {
      return true;
    }
    case "BallSkin": {
      if (!__eq_BallKind(a._0, b._0)) return false;
      return true;
    }
    case "PitSkin": {
      return true;
    }
    case "BadgeSkin": {
      if (a._0 !== b._0) return false;
      if (a._1 !== b._1) return false;
      return true;
    }
    case "CoinSkin": {
      if (!__eq_Symbol(a._0, b._0)) return false;
      return true;
    }
    case "BlobSkin": {
      return true;
    }
    case "HaloSkin": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Role(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "FloorPart": {
      return true;
    }
    case "LaneSlab": {
      return true;
    }
    case "RailPart": {
      return true;
    }
    case "RailCap": {
      return true;
    }
    case "BodyPart": {
      return true;
    }
    case "HumpPart": {
      return true;
    }
    case "PanelPart": {
      return true;
    }
    case "ZonePart": {
      return true;
    }
    case "LipPart": {
      return true;
    }
    case "PitPart": {
      return true;
    }
    case "RimPart": {
      return true;
    }
    case "BadgePart": {
      return true;
    }
    case "CoinPart": {
      if (!__eq_Hole(a._0, b._0)) return false;
      return true;
    }
    case "HaloPart": {
      if (!__eq_Hole(a._0, b._0)) return false;
      return true;
    }
    case "SideWall": {
      return true;
    }
    case "BackCap": {
      return true;
    }
    case "BulbPart": {
      return true;
    }
    case "TroughPart": {
      return true;
    }
    case "WaitingBall": {
      return true;
    }
    case "ShadowPart": {
      return true;
    }
    case "BallPart": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Emit(a, b) {
  if (a.glow_r !== b.glow_r) return false;
  if (a.glow_g !== b.glow_g) return false;
  if (a.glow_b !== b.glow_b) return false;
  return true;
}

function __eq_Skee$Scene$Part(a, b) {
  if (!__eq_Solid(a.solid, b.solid)) return false;
  if (!__eq_Frame(a.frame, b.frame)) return false;
  if (!__eq_Role(a.role, b.role)) return false;
  if (!__eq_Option(a.colour, b.colour)) return false;
  if (!__eq_Skin(a.skin, b.skin)) return false;
  if (a.outline !== b.outline) return false;
  if (a.hidden !== b.hidden) return false;
  if (a.opacity !== b.opacity) return false;
  if (!__eq_Emit(a.emission, b.emission)) return false;
  return true;
}

function __eq_Skee$Scene$Quat(a, b) {
  if (a.qw !== b.qw) return false;
  if (a.qx !== b.qx) return false;
  if (a.qy !== b.qy) return false;
  if (a.qz !== b.qz) return false;
  return true;
}

function __eq_Skee$Scene$BallPlace(a, b) {
  if (!__eq_Vec3(a.centre, b.centre)) return false;
  if (a.scale !== b.scale) return false;
  if (!__eq_Vec3(a.normal, b.normal)) return false;
  if (a.airborne !== b.airborne) return false;
  if (a.visible !== b.visible) return false;
  if (a.sink !== b.sink) return false;
  if (a.over_board !== b.over_board) return false;
  return true;
}

function __eq_Skee$Scene$ShadowPlace(a, b) {
  if (!__eq_Vec3(a.spot, b.spot)) return false;
  if (!__eq_Vec3(a.facing, b.facing)) return false;
  if (a.size !== b.size) return false;
  if (a.fade !== b.fade) return false;
  if (a.shown !== b.shown) return false;
  return true;
}

function __eq_Skee$Scene$BallCue(a, b) {
  if (!__eq_Option(a.sample, b.sample)) return false;
  if (a.busy !== b.busy) return false;
  if (a.beat_is_roll !== b.beat_is_roll) return false;
  if (!__eq_Option(a.resting, b.resting)) return false;
  if (a.clock !== b.clock) return false;
  if (a.throwing !== b.throwing) return false;
  if (!__eq_Option(a.held, b.held)) return false;
  return true;
}

function __eq_Skee$Scene$Motion(a, b) {
  if (!__eq_Quat(a.orientation, b.orientation)) return false;
  if (!__eq_Option(a.last, b.last)) return false;
  if (!__eq_Vec3(a.spin, b.spin)) return false;
  if (a.pop !== b.pop) return false;
  return true;
}

function __eq_Skee$Scene$Spark(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SparkHump": {
      return true;
    }
    case "SparkLip": {
      return true;
    }
    case "SparkHop": {
      return true;
    }
    case "SparkLanded": {
      return true;
    }
    case "SparkBackwall": {
      return true;
    }
    case "SparkRail": {
      return true;
    }
    case "SparkDrop": {
      if (!__eq_Hole(a._0, b._0)) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Wave(a, b) {
  if (!__eq_Vec3(a.spot, b.spot)) return false;
  if (!__eq_Vec3(a.facing, b.facing)) return false;
  if (a.age !== b.age) return false;
  if (a.size !== b.size) return false;
  return true;
}

function __eq_Skee$Scene$ReelLook(a, b) {
  if (!__eq_Symbol(a.symbol, b.symbol)) return false;
  if (a.turn !== b.turn) return false;
  if (a.glow !== b.glow) return false;
  if (a.slot_match !== b.slot_match) return false;
  if (a.pulse !== b.pulse) return false;
  return true;
}

function __eq_Skee$Scene$ReelCue(a, b) {
  if (!__eq_BoardSetup(a.setup, b.setup)) return false;
  if (!__eq_PerReel(a.positions, b.positions)) return false;
  if (!__eq_List(a.have, b.have)) return false;
  if (!__eq_Option(a.slot, b.slot)) return false;
  return true;
}

function __eq_Skee$Scene$FrameCue(a, b) {
  if (!__eq_BallCue(a.ball_cue, b.ball_cue)) return false;
  if (!__eq_List(a.sparks, b.sparks)) return false;
  if (!__eq_BallKind(a.kind, b.kind)) return false;
  if (a.anticipation !== b.anticipation) return false;
  if (a.shake !== b.shake) return false;
  if (a.balls_left !== b.balls_left) return false;
  if (a.excited !== b.excited) return false;
  if (!__eq_ReelCue(a.reel_cue, b.reel_cue)) return false;
  return true;
}

function __eq_Skee$Scene$Keep(a, b) {
  if (!__eq_Motion(a.motion, b.motion)) return false;
  if (a.lean !== b.lean) return false;
  if (!__eq_List(a.waves, b.waves)) return false;
  if (!__eq_PerReel(a.flash_age, b.flash_age)) return false;
  return true;
}

function __eq_Skee$Scene$BulbLight(a, b) {
  if (a.chase !== b.chase) return false;
  if (a.level !== b.level) return false;
  return true;
}

function __eq_Skee$Scene$BallView(a, b) {
  if (!__eq_BallPlace(a.place, b.place)) return false;
  if (!__eq_Motion(a.motion, b.motion)) return false;
  if (!__eq_BallKind(a.kind, b.kind)) return false;
  if (!__eq_ShadowPlace(a.shadow, b.shadow)) return false;
  return true;
}

function __eq_Skee$Scene$Scenery(a, b) {
  if (!__eq_World(a.world, b.world)) return false;
  if (!__eq_Skee$Rooms$CabinetPalette(a.palette, b.palette)) return false;
  if (!__eq_Skee$Camera$Viewport(a.viewport, b.viewport)) return false;
  if (!__eq_Skee$Camera$Rig(a.camera, b.camera)) return false;
  if (!__eq_BallView(a.ball, b.ball)) return false;
  if (a.waiting !== b.waiting) return false;
  if (!__eq_PerReel(a.reels, b.reels)) return false;
  if (!__eq_BulbLight(a.bulbs, b.bulbs)) return false;
  if (!__eq_List(a.waves, b.waves)) return false;
  return true;
}

function __eq_Skee$Scene$Light(a, b) {
  if (a.lr !== b.lr) return false;
  if (a.lg !== b.lg) return false;
  if (a.lb !== b.lb) return false;
  if (a.rim !== b.rim) return false;
  if (a.er !== b.er) return false;
  if (a.eg !== b.eg) return false;
  if (a.eb !== b.eb) return false;
  return true;
}

function __eq_Skee$Scene$ReelLayout(a, b) {
  if (!__eq_Hole(a.reel_hole, b.reel_hole)) return false;
  if (!__eq_Vec2(a.centre, b.centre)) return false;
  if (a.radius !== b.radius) return false;
  if (a.count !== b.count) return false;
  if (a.size !== b.size) return false;
  if (a.phase !== b.phase) return false;
  if (a.band_in !== b.band_in) return false;
  if (a.band_out !== b.band_out) return false;
  return true;
}

function __eq_Skee$Scene$Coin(a, b) {
  if (!__eq_Vec3(a.local, b.local)) return false;
  if (a.coin_hidden !== b.coin_hidden) return false;
  if (a.swell !== b.swell) return false;
  return true;
}

function __eq_Skee$Scene$Brush(a, b) {
  if (!__eq_Skee$Consts$Consts(a.k, b.k)) return false;
  if (!__eq_Skee$Camera$Lens(a.lens, b.lens)) return false;
  if (!__eq_Vec3(a.eye, b.eye)) return false;
  if (a.ink_px !== b.ink_px) return false;
  return true;
}

function __eq_Skee$Scene$BoxFace(a, b) {
  if (!__eq_List(a.corners, b.corners)) return false;
  if (!__eq_Vec3(a.outward, b.outward)) return false;
  return true;
}

function __eq_Skee$Scene$Plank(a, b) {
  if (a.tone !== b.tone) return false;
  if (!__eq_List(a.streaks, b.streaks)) return false;
  return true;
}

function __eq_Skee$Scene$Mark(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "MarkFill": {
      if (!__eq_List(a._0, b._0)) return false;
      if (!__eq_Rgba(a._1, b._1)) return false;
      return true;
    }
    case "MarkLines": {
      if (!__eq_List(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_Rgba(a._2, b._2)) return false;
      return true;
    }
    case "MarkEdge": {
      if (!__eq_List(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (!__eq_Rgba(a._2, b._2)) return false;
      return true;
    }
    case "MarkRing": {
      if (!__eq_Vec2(a._0, b._0)) return false;
      if (a._1 !== b._1) return false;
      if (a._2 !== b._2) return false;
      if (!__eq_Rgba(a._3, b._3)) return false;
      return true;
    }
    case "Undrawn": {
      if (!__eq_Vec2(a._0, b._0)) return false;
      if (!__eq_Vec2(a._1, b._1)) return false;
      if (a._2 !== b._2) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Texel(a, b) {
  if (a.tr !== b.tr) return false;
  if (a.tg !== b.tg) return false;
  if (a.tb !== b.tb) return false;
  if (a.ta !== b.ta) return false;
  if (a.clean !== b.clean) return false;
  if (a.top !== b.top) return false;
  return true;
}

function __eq_Skee$Scene$Placed(a, b) {
  if (!__eq_Mark(a.mark, b.mark)) return false;
  if (a.index !== b.index) return false;
  if (!__eq_Vec2(a.lo, b.lo)) return false;
  if (!__eq_Vec2(a.hi, b.hi)) return false;
  return true;
}

function __eq_Skee$Scene$Cover(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "DeepIn": {
      return true;
    }
    case "DeepOut": {
      return true;
    }
    case "NearEdge": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scene$Square(a, b) {
  if (a.x0 !== b.x0) return false;
  if (a.y0 !== b.y0) return false;
  if (a.side !== b.side) return false;
  if (!__eq_Light(a.lit, b.lit)) return false;
  return true;
}

function __eq_Skee$Scene$Ranked(a, b) {
  if (a.rank !== b.rank) return false;
  if (a.index !== b.index) return false;
  if (!__eq_Part(a.ranked, b.ranked)) return false;
  return true;
}

function __eq_Skee$Scoring$WindowRow(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "TopRow": {
      return true;
    }
    case "CentreRow": {
      return true;
    }
    case "BottomRow": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scoring$WindowReel(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "Reel0": {
      return true;
    }
    case "Reel1": {
      return true;
    }
    case "Reel2": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Scoring$FrameTally(a, b) {
  if (!__eq_Chips(a.chips, b.chips)) return false;
  if (a.mult !== b.mult) return false;
  if (!__eq_Tickets(a.tickets, b.tickets)) return false;
  return true;
}

function __eq_Skee$Stroke$FlickMetrics(a, b) {
  if (a.peak_speed !== b.peak_speed) return false;
  if (a.release_speed !== b.release_speed) return false;
  if (a.flick_duration !== b.flick_duration) return false;
  if (a.jerk !== b.jerk) return false;
  if (a.snap !== b.snap) return false;
  if (a.side !== b.side) return false;
  if (a.flick_speed !== b.flick_speed) return false;
  return true;
}

function __eq_Skee$Stroke$FlickTrack(a, b) {
  if (a.tt !== b.tt) return false;
  if (a.tx !== b.tx) return false;
  if (a.ty !== b.ty) return false;
  return true;
}

function __eq_Skee$Synth$Sound(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "SndLaunch": {
      return true;
    }
    case "SndRail": {
      return true;
    }
    case "SndHump": {
      return true;
    }
    case "SndLip": {
      return true;
    }
    case "SndBackwall": {
      return true;
    }
    case "SndLanded": {
      return true;
    }
    case "SndDrop": {
      if (!__eq_Hole(a._0, b._0)) return false;
      return true;
    }
    case "SndGutter": {
      return true;
    }
    case "SndHop": {
      return true;
    }
    case "SndWhoosh": {
      return true;
    }
    case "SndHotSpot": {
      return true;
    }
    case "SndLever": {
      return true;
    }
    case "SndPullWin": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SndReelTick": {
      return true;
    }
    case "SndReelStop": {
      return true;
    }
    case "SndCombo": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SndTallyChips": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SndTallyMult": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SndFrameDone": {
      return true;
    }
    case "SndLineWon": {
      return true;
    }
    case "SndJackpot": {
      return true;
    }
    case "SndBanner": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "SndFoul": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Synth$SynthWave(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "WaveSine": {
      return true;
    }
    case "WaveSquare": {
      return true;
    }
    case "WaveTri": {
      return true;
    }
    case "WaveNoise": {
      return true;
    }
  }
  return true;
}

function __eq_Skee$Synth$SynthVoice(a, b) {
  if (!__eq_SynthWave(a.wave, b.wave)) return false;
  if (a.freq !== b.freq) return false;
  if (a.freq_end !== b.freq_end) return false;
  if (a.glide_floor !== b.glide_floor) return false;
  if (a.amp !== b.amp) return false;
  if (a.decay !== b.decay) return false;
  if (a.life !== b.life) return false;
  if (a.delay !== b.delay) return false;
  if (a.t !== b.t) return false;
  if (a.phase !== b.phase) return false;
  return true;
}

function __eq_Skee$Synth$SynthConsts(a, b) {
  if (a.split !== b.split) return false;
  if (a.tiny !== b.tiny) return false;
  if (a.subnormal_shift !== b.subnormal_shift) return false;
  if (a.overflow !== b.overflow) return false;
  if (a.infinity !== b.infinity) return false;
  if (a.dt !== b.dt) return false;
  if (a.pi !== b.pi) return false;
  if (a.rumble_follow !== b.rumble_follow) return false;
  if (a.lowpass_follow !== b.lowpass_follow) return false;
  if (a.rumble_gain !== b.rumble_gain) return false;
  if (a.drum_step !== b.drum_step) return false;
  if (a.min_glide !== b.min_glide) return false;
  if (a.attack_time !== b.attack_time) return false;
  if (a.square_level !== b.square_level) return false;
  if (a.default_glide !== b.default_glide) return false;
  return true;
}

function __eq_Skee$Synth$Synth(a, b) {
  if (!__eq_List(a.voices, b.voices)) return false;
  if (a.lowpass !== b.lowpass) return false;
  if (a.rumble !== b.rumble) return false;
  if (a.drum_clock !== b.drum_clock) return false;
  if (a.seed !== b.seed) return false;
  if (a.rumble_target !== b.rumble_target) return false;
  if (a.drum !== b.drum) return false;
  if (!__eq_SynthConsts(a.c, b.c)) return false;
  return true;
}

function __eq_Skee$Synth$Mix(a, b) {
  if (a.level !== b.level) return false;
  if (a.mix_seed !== b.mix_seed) return false;
  if (!__eq_List(a.kept, b.kept)) return false;
  return true;
}

function __eq_Skee$SynthFeed$AudioCmd(a, b) {
  if (a.$ !== b.$) return false;
  switch (a.$) {
    case "CmdPlay": {
      if (!__eq_Sound(a._0, b._0)) return false;
      return true;
    }
    case "CmdRumble": {
      if (a._0 !== b._0) return false;
      return true;
    }
    case "CmdDrum": {
      if (a._0 !== b._0) return false;
      return true;
    }
  }
  return true;
}

function __eq_Skee$SynthFeed$Levels(a, b) {
  if (a.lvl_rumble !== b.lvl_rumble) return false;
  if (a.lvl_drum !== b.lvl_drum) return false;
  return true;
}

function __eq_Audio$AudioHandle(a, b) {
  if (a.audio_started !== b.audio_started) return false;
  return true;
}

function __eq_Game$ShellState(a, b) {
  if (!__eq_Skee$App$Model(a.model, b.model)) return false;
  if (!__eq_Skee$Consts$Consts(a.k, b.k)) return false;
  if (!__eq_Js$Dom$Node(a.canvas, b.canvas)) return false;
  if (!__eq_Js$Canvas$Context(a.ctx, b.ctx)) return false;
  if (!__eq_Hud$HudHandle(a.hud, b.hud)) return false;
  if (!__eq_Audio$AudioHandle(a.audio, b.audio)) return false;
  if (a.width !== b.width) return false;
  if (a.height !== b.height) return false;
  if (a.dpr !== b.dpr) return false;
  return true;
}

function __eq_Hud$HudHandle(a, b) {
  if (!__eq_Js$Dom$Node(a.hud_root, b.hud_root)) return false;
  return true;
}

function Skee$Consts$parse(text) {
  {
    const $t48559 = march_string_to_float(text);
    switch ($t48559.$) {
      case "Some": {
        const $f48560 = $t48559._0;
        {
          const x = $f48560;
          return x;
        }
        break;
      }
      case "None": {
        undefined;
        return unreachable();
        break;
      }
      default: {
        return (() => { throw new Error("non-exhaustive pattern match"); })();
      }
    }
  }
}
const Skee$Consts$parse$clo = { _0: ($_, text) => Skee$Consts$parse(text) };

function Skee$Synth$pow2($tco_a0, $tco_a1) {
  __tco: for (;;) {
    const e = $tco_a0;
    const acc = $tco_a1;
    {
      const $t63743 = (e > 0);
      if ($t63743 === true) {
        {
          const $t63744 = ((e - 1) < 4611686018427387904 && (e - 1) >= -4611686018427387904 ? (e - 1) : march_int_ovf((e - 1), 1));
          {
            const $t63745 = (acc * 2.);
            {
              $tco_a0 = $t63744;
              $tco_a1 = $t63745;
              continue __tco;
            }
          }
        }
      } else {
        {
          const $t63746 = (e < 0);
          if ($t63746 === true) {
            {
              const $t63747 = ((e + 1) < 4611686018427387904 && (e + 1) >= -4611686018427387904 ? (e + 1) : march_int_ovf((e + 1), 0));
              {
                const $t63748 = (acc * 0.5);
                {
                  $tco_a0 = $t63747;
                  $tco_a1 = $t63748;
                  continue __tco;
                }
              }
            }
          } else {
            return acc;
          }
        }
      }
    }
    return undefined;
  }
}
const Skee$Synth$pow2$clo = { _0: ($_, e, acc) => Skee$Synth$pow2(e, acc) };

function Skee$Synth$consts() {
  {
    let r;
    {
      let $t63750_i11330;
      {
        const $t63749_i11329 = march_int_ovf(-(126), 3);
        $t63750_i11330 = Skee$Synth$pow2($t63749_i11329, 1.);
      }
      {
        let $t63752_i11332;
        {
          const $t63751_i11331 = march_int_ovf(-(97), 3);
          $t63752_i11332 = Skee$Synth$pow2($t63751_i11331, 1.5);
        }
        {
          let $t63755_i11335;
          {
            const $t63753_i11333 = Skee$Synth$pow2(128, 1.);
            {
              const $t63754_i11334 = Skee$Synth$pow2(103, 1.);
              $t63755_i11335 = ($t63753_i11333 - $t63754_i11334);
            }
          }
          {
            let $t63757_i11337;
            {
              const $t63756_i11336 = Skee$Synth$pow2(1023, 1.);
              $t63757_i11337 = ($t63756_i11336 * 2.);
            }
            r = ({ split: 536870913., tiny: $t63750_i11330, subnormal_shift: $t63752_i11332, overflow: $t63755_i11335, infinity: $t63757_i11337, dt: 0., pi: 0., rumble_follow: 0., lowpass_follow: 0., rumble_gain: 0., drum_step: 0., min_glide: 0., attack_time: 0., square_level: 0., default_glide: 0. });
          }
        }
      }
    }
    {
      let k;
      {
        const $t48561_i11320 = Skee$Consts$parse("3.141592653589793");
        {
          const $t48562_i11321 = Skee$Consts$parse("6.283185307179586");
          {
            const $t48563_i11322 = Skee$Consts$parse("0.004166666666666667");
            {
              const $t48564_i11323 = Skee$Consts$parse("1.1102230246251565e-16");
              {
                let $t48566_i11325;
                {
                  const $t48565_i11324 = Skee$Consts$parse("1e308");
                  $t48566_i11325 = ($t48565_i11324 * 10.);
                }
                {
                  let $t48568_i11327;
                  {
                    const $t48567_i11326 = (-1.);
                    $t48568_i11327 = Math.sqrt($t48567_i11326);
                  }
                  {
                    const $t48569_i11328 = Skee$Consts$parse("1.2999999523162842");
                    k = ({ pi: $t48561_i11320, tau: $t48562_i11321, dt: $t48563_i11322, unit53: $t48564_i11323, floor_u1: 1e-12, infinity: $t48566_i11325, nan: $t48568_i11327, marshmallow_drawn: $t48569_i11328 });
                  }
                }
              }
            }
          }
        }
      }
      {
        let $t63763;
        {
          const $t63762 = (1. / 44100.);
          $t63763 = Skee$Synth$f32(r, $t63762);
        }
        {
          let $t63765;
          {
            const $t63764 = k.pi;
            {
              const nearest_i11316 = Skee$Synth$f32(r, $t63764);
              {
                const $t63758_i11317 = (nearest_i11316 > $t63764);
                if ($t63758_i11317 === true) {
                  {
                    let $t63760_i11319;
                    {
                      const $t63759_i11318 = march_int_ovf(-(22), 3);
                      $t63760_i11319 = Skee$Synth$pow2($t63759_i11318, 1.);
                    }
                    $t63765 = (nearest_i11316 - $t63760_i11319);
                  }
                } else {
                  $t63765 = nearest_i11316;
                }
              }
            }
          }
          {
            let $t63766;
            $t63766 = Skee$Synth$f32(r, 0.0008);
            {
              let $t63767;
              $t63767 = Skee$Synth$f32(r, 0.035);
              {
                let $t63768;
                $t63768 = Skee$Synth$f32(r, 0.9);
                {
                  let $t63769;
                  $t63769 = Skee$Synth$f32(r, 0.055);
                  {
                    let $t63770;
                    $t63770 = Skee$Synth$f32(r, 0.0001);
                    {
                      let $t63771;
                      $t63771 = Skee$Synth$f32(r, 0.003);
                      {
                        let $t63772;
                        $t63772 = Skee$Synth$f32(r, 0.6);
                        {
                          let $t63773;
                          $t63773 = Skee$Synth$f32(r, 0.1);
                          {
                            const $rc_3527 = ({ ...r, dt: $t63763, pi: $t63765, rumble_follow: $t63766, lowpass_follow: $t63767, rumble_gain: $t63768, drum_step: $t63769, min_glide: $t63770, attack_time: $t63771, square_level: $t63772, default_glide: $t63773 });
                            return $rc_3527;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$consts$clo = { _0: ($_) => Skee$Synth$consts() };

function Skee$Synth$f32(c, x) {
  {
    let ax;
    {
      const $t63774 = (x < 0.);
      if ($t63774 === true) {
        ax = (0. - x);
      } else {
        ax = x;
      }
    }
    {
      let $t63776;
      {
        const $t63775 = c.overflow;
        $t63776 = (ax >= $t63775);
      }
      if ($t63776 === true) {
        {
          const $t63777 = (x < 0.);
          if ($t63777 === true) {
            {
              const $t63778 = c.infinity;
              return (0. - $t63778);
            }
          } else {
            {
              const $rc_3530 = c.infinity;
              return $rc_3530;
            }
          }
        }
      } else {
        {
          let $t63780;
          {
            const $t63779 = c.tiny;
            $t63780 = (ax < $t63779);
          }
          if ($t63780 === true) {
            {
              let r;
              {
                let $t63782;
                {
                  const $t63781 = c.subnormal_shift;
                  $t63782 = (x + $t63781);
                }
                {
                  const $t63783 = c.subnormal_shift;
                  r = ($t63782 - $t63783);
                }
              }
              {
                const $t63784 = (r === 0.);
                if ($t63784 === true) {
                  return (x * 0.);
                } else {
                  return r;
                }
              }
            }
          } else {
            {
              let p;
              {
                const $t63785 = c.split;
                p = (x * $t63785);
              }
              {
                const $t63786 = (p - x);
                return (p - $t63786);
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$f32$clo = { _0: ($_, c, x) => Skee$Synth$f32(c, x) };

function Skee$Synth$voice(c, w, f, to, glide, amp, decay, delay) {
  {
    let d;
    d = Skee$Synth$f32(c, decay);
    {
      let $t63795;
      $t63795 = Skee$Synth$f32(c, f);
      {
        let $t63796;
        $t63796 = Skee$Synth$f32(c, to);
        {
          let $t63799;
          {
            let $t63797;
            $t63797 = Skee$Synth$f32(c, glide);
            {
              const $t63798 = c.min_glide;
              {
                const $t47993_i11345 = ($t63798 >= $t63797);
                if ($t47993_i11345 === true) {
                  $t63799 = $t63798;
                } else {
                  $t63799 = $t63797;
                }
              }
            }
          }
          {
            let $t63800;
            $t63800 = Skee$Synth$f32(c, amp);
            {
              let $t63802;
              {
                const $t63801 = (d * 6.);
                $t63802 = Skee$Synth$f32(c, $t63801);
              }
              {
                const $t63803 = Skee$Synth$f32(c, delay);
                return ({ wave: w, freq: $t63795, freq_end: $t63796, glide_floor: $t63799, amp: $t63800, decay: d, life: $t63802, delay: $t63803, t: 0., phase: 0. });
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$voice$clo = { _0: ($_, c, w, f, to, glide, amp, decay, delay) => Skee$Synth$voice(c, w, f, to, glide, amp, decay, delay) };

function Skee$Synth$times(c, i, x) {
  {
    let $t63809;
    {
      const $t63807 = i;
      {
        let $t63808;
        $t63808 = Skee$Synth$f32(c, x);
        $t63809 = ($t63807 * $t63808);
      }
    }
    return Skee$Synth$f32(c, $t63809);
  }
}
const Skee$Synth$times$clo = { _0: ($_, c, i, x) => Skee$Synth$times(c, i, x) };

function Skee$Synth$after(c, start, i, step) {
  {
    let $t63812;
    {
      let $t63810;
      $t63810 = Skee$Synth$f32(c, start);
      {
        let $t63811;
        $t63811 = Skee$Synth$times(c, i, step);
        $t63812 = ($t63810 + $t63811);
      }
    }
    return Skee$Synth$f32(c, $t63812);
  }
}
const Skee$Synth$after$clo = { _0: ($_, c, start, i, step) => Skee$Synth$after(c, start, i, step) };

function Skee$Synth$arpeggio_from($tco_a0, $tco_a1, $tco_a2, $tco_a3, $tco_a4, $tco_a5, $tco_a6, $tco_a7) {
  __tco: for (;;) {
    const c = $tco_a0;
    const notes = $tco_a1;
    const i = $tco_a2;
    const step = $tco_a3;
    const amp = $tco_a4;
    const decay = $tco_a5;
    const w = $tco_a6;
    const acc = $tco_a7;
    switch (notes.$) {
      case "Nil": {
        {
          const $t2258_i11347 = { $: "Nil" };
          return List$reverse_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(acc, $t2258_i11347);
        }
        break;
      }
      case "Cons": {
        const $f63817 = notes._0;
        const $f63818 = notes._1;
        {
          const rest = $f63818;
          {
            const f = $f63817;
            {
              const $t63813 = ((i + 1) < 4611686018427387904 && (i + 1) >= -4611686018427387904 ? (i + 1) : march_int_ovf((i + 1), 0));
              {
                let $t63815;
                {
                  let $t63814;
                  $t63814 = Skee$Synth$times(c, i, step);
                  {
                    const $t63805_i11354 = c.default_glide;
                    $t63815 = Skee$Synth$voice(c, w, f, f, $t63805_i11354, amp, decay, $t63814);
                  }
                }
                {
                  const $t63816 = { $: "Cons", _0: $t63815, _1: acc };
                  {
                    $tco_a0 = c;
                    $tco_a1 = rest;
                    $tco_a2 = $t63813;
                    $tco_a3 = step;
                    $tco_a4 = amp;
                    $tco_a5 = decay;
                    $tco_a6 = w;
                    $tco_a7 = $t63816;
                    continue __tco;
                  }
                }
              }
            }
          }
        }
        break;
      }
      default: {
        return (() => { throw new Error("non-exhaustive pattern match"); })();
      }
    }
    return undefined;
  }
}
const Skee$Synth$arpeggio_from$clo = { _0: ($_, c, notes, i, step, amp, decay, w, acc) => Skee$Synth$arpeggio_from(c, notes, i, step, amp, decay, w, acc) };

function Skee$Synth$bell(c, pitch, loudness, delay) {
  {
    let f;
    f = Skee$Synth$f32(c, pitch);
    {
      let amp;
      amp = Skee$Synth$f32(c, loudness);
      {
        let $t63825;
        {
          const $t63824 = { $: "WaveSine" };
          {
            const $t63805_i11375 = c.default_glide;
            $t63825 = Skee$Synth$voice(c, $t63824, f, f, $t63805_i11375, amp, 0.5, delay);
          }
        }
        {
          let $t63831;
          {
            const $t63826 = { $: "WaveSine" };
            {
              let $t63828;
              {
                let $t63827;
                $t63827 = Skee$Synth$f32(c, 2.76);
                $t63828 = (f * $t63827);
              }
              {
                let $t63830;
                {
                  let $t63829;
                  $t63829 = Skee$Synth$f32(c, 0.35);
                  $t63830 = (amp * $t63829);
                }
                {
                  const $t63805_i11368 = c.default_glide;
                  $t63831 = Skee$Synth$voice(c, $t63826, $t63828, $t63828, $t63805_i11368, $t63830, 0.25, delay);
                }
              }
            }
          }
          {
            let $t63837;
            {
              const $t63832 = { $: "WaveSine" };
              {
                let $t63834;
                {
                  let $t63833;
                  $t63833 = Skee$Synth$f32(c, 5.4);
                  $t63834 = (f * $t63833);
                }
                {
                  let $t63836;
                  {
                    let $t63835;
                    $t63835 = Skee$Synth$f32(c, 0.15);
                    $t63836 = (amp * $t63835);
                  }
                  {
                    const $t63805_i11361 = c.default_glide;
                    $t63837 = Skee$Synth$voice(c, $t63832, $t63834, $t63834, $t63805_i11361, $t63836, 0.12, delay);
                  }
                }
              }
            }
            {
              const $t63838 = { $: "Nil" };
              {
                const $t63839 = { $: "Cons", _0: $t63837, _1: $t63838 };
                {
                  const $t63840 = { $: "Cons", _0: $t63831, _1: $t63839 };
                  return { $: "Cons", _0: $t63825, _1: $t63840 };
                }
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$bell$clo = { _0: ($_, c, pitch, loudness, delay) => Skee$Synth$bell(c, pitch, loudness, delay) };

function Skee$Synth$upto_from($tco_a0, $tco_a1, $tco_a2, $tco_a3) {
  __tco: for (;;) {
    const i = $tco_a0;
    const n = $tco_a1;
    const f = $tco_a2;
    const acc = $tco_a3;
    {
      const $t63842 = (i < n);
      if ($t63842 === true) {
        {
          const $t63843 = ((i + 1) < 4611686018427387904 && (i + 1) >= -4611686018427387904 ? (i + 1) : march_int_ovf((i + 1), 0));
          {
            let $t63844;
            $t63844 = f._0(f, i);
            {
              const $t63845 = { $: "Cons", _0: $t63844, _1: acc };
              {
                $tco_a0 = $t63843;
                $tco_a1 = n;
                $tco_a2 = f;
                $tco_a3 = $t63845;
                continue __tco;
              }
            }
          }
        }
      } else {
        {
          const $t2258_i11377 = { $: "Nil" };
          return List$reverse_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(acc, $t2258_i11377);
        }
      }
    }
    return undefined;
  }
}
const Skee$Synth$upto_from$clo = { _0: ($_, i, n, f, acc) => Skee$Synth$upto_from(i, n, f, acc) };

function Skee$Synth$drop_voices(c, h) {
  {
    let $p63850;
    switch (h.$) {
      case "Ring10": {
        $p63850 = { _0: 523., _1: false };
        break;
      }
      case "Ring20": {
        $p63850 = { _0: 587., _1: false };
        break;
      }
      case "Ring30": {
        $p63850 = { _0: 659., _1: false };
        break;
      }
      case "Ring40": {
        $p63850 = { _0: 784., _1: false };
        break;
      }
      case "Ring50": {
        $p63850 = { _0: 1046., _1: true };
        break;
      }
      case "PocketLeft": {
        $p63850 = { _0: 1318., _1: true };
        break;
      }
      case "PocketRight": {
        $p63850 = { _0: 1318., _1: true };
        break;
      }
      case "Gutter": {
        $p63850 = { _0: 220., _1: false };
        break;
      }
      default: {
        throw new Error("non-exhaustive pattern match");
        break;
      }
    }
    {
      const pitch = $p63850._0;
      {
        const big = $p63850._1;
        {
          let thud;
          {
            const $t63846 = { $: "WaveSine" };
            thud = Skee$Synth$voice(c, $t63846, 120., 50., 0.25, 0.6, 0.2, 0.);
          }
          {
            let $t63847;
            $t63847 = Skee$Synth$bell(c, pitch, 0.3, 0.04);
            {
              const ring = { $: "Cons", _0: thud, _1: $t63847 };
              if (big === true) {
                {
                  const $t63848 = (pitch * 1.5);
                  {
                    const $t63849 = Skee$Synth$bell(c, $t63848, 0.2, 0.12);
                    return List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(ring, $t63849);
                  }
                }
              } else {
                return ring;
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$drop_voices$clo = { _0: ($_, c, h) => Skee$Synth$drop_voices(c, h) };

function Skee$Synth$combo_voices(c, n) {
  {
    let k;
    {
      let $t63854;
      $t63854 = Skee$Synth$f32(c, 1.0595);
      {
        let $t63857;
        {
          let $t63856;
          {
            let $t63855;
            {
              const $t3742_i11404 = (n < 6);
              if ($t3742_i11404 === true) {
                $t63855 = n;
              } else {
                $t63855 = 6;
              }
            }
            $t63856 = ((2 * $t63855) < 4611686018427387904 && (2 * $t63855) >= -4611686018427387904 ? (2 * $t63855) : march_int_ovf((2 * $t63855), 2));
          }
          $t63857 = $t63856;
        }
        {
          const $t63789_i11401 = Math.pow($t63854, $t63857);
          k = Skee$Synth$f32(c, $t63789_i11401);
        }
      }
    }
    {
      let $t63860;
      {
        const $t63858 = { $: "WaveSquare" };
        {
          const $t63859 = (659. * k);
          {
            const $t63804_i11397 = c.default_glide;
            $t63860 = Skee$Synth$voice(c, $t63858, $t63859, $t63859, $t63804_i11397, 0.1, 0.08, 0.);
          }
        }
      }
      {
        let $t63863;
        {
          const $t63861 = { $: "WaveSquare" };
          {
            const $t63862 = (988. * k);
            {
              const $t63805_i11391 = c.default_glide;
              $t63863 = Skee$Synth$voice(c, $t63861, $t63862, $t63862, $t63805_i11391, 0.1, 0.14, 0.07);
            }
          }
        }
        {
          const $t63864 = { $: "Nil" };
          {
            const $t63865 = { $: "Cons", _0: $t63863, _1: $t63864 };
            {
              const $t63866 = { $: "Cons", _0: $t63860, _1: $t63865 };
              {
                const $t63867 = (1318. * k);
                {
                  const $t63868 = Skee$Synth$bell(c, $t63867, 0.15, 0.14);
                  return List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($t63866, $t63868);
                }
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$combo_voices$clo = { _0: ($_, c, n) => Skee$Synth$combo_voices(c, n) };

function Skee$Synth$tally_step(c, i) {
  {
    let $t63869;
    $t63869 = Skee$Synth$f32(c, 1.06);
    {
      const $t63870 = i;
      {
        const $t63789_i11408 = Math.pow($t63869, $t63870);
        return Skee$Synth$f32(c, $t63789_i11408);
      }
    }
  }
}
const Skee$Synth$tally_step$clo = { _0: ($_, c, i) => Skee$Synth$tally_step(c, i) };

function Skee$Synth$hot_spot_voices(c) {
  {
    let $t63879;
    $t63879 = { $: "$Clo_$lam0_Skee_Synth_hot_spot_voices$0_Skee_Synth_hot_spot_voices", _0: $lam0_Skee_Synth_hot_spot_voices$apply$0_Skee_Synth_hot_spot_voices, _1: c };
    {
      let sparkle;
      {
        const f_i11421 = $t63879;
        {
          const $t63841_i11422 = { $: "Nil" };
          sparkle = Skee$Synth$upto_from(0, 14, f_i11421, $t63841_i11422);
        }
      }
      {
        const $t63880 = { $: "Nil" };
        {
          const $t63881 = { $: "Cons", _0: 2093., _1: $t63880 };
          {
            const $t63882 = { $: "Cons", _0: 1568., _1: $t63881 };
            {
              const $t63883 = { $: "Cons", _0: 1318., _1: $t63882 };
              {
                const $t63884 = { $: "Cons", _0: 1046., _1: $t63883 };
                {
                  const $t63885 = { $: "WaveTri" };
                  {
                    let $t63886;
                    {
                      const $t63823_i11419 = { $: "Nil" };
                      $t63886 = Skee$Synth$arpeggio_from(c, $t63884, 0, 0.05, 0.2, 0.3, $t63885, $t63823_i11419);
                    }
                    {
                      const $t63887 = Skee$Synth$bell(c, 2093., 0.22, 0.2);
                      {
                        const $t63888 = { $: "Nil" };
                        {
                          const $t63889 = { $: "Cons", _0: sparkle, _1: $t63888 };
                          {
                            const $t63890 = { $: "Cons", _0: $t63887, _1: $t63889 };
                            {
                              const $t63891 = { $: "Cons", _0: $t63886, _1: $t63890 };
                              {
                                const prepend_reversed_i11410 = { $: "$Clo_prepend_reversed$0_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave", _0: prepend_reversed$apply$0_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave };
                                {
                                  const go_i11411 = { $: "$Clo_go$1_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave", _0: go$apply$1_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave, _1: prepend_reversed_i11410 };
                                  {
                                    const $t2393_i11412 = { $: "Nil" };
                                    return go$apply$1_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(go_i11411, $t63891, $t2393_i11412);
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$hot_spot_voices$clo = { _0: ($_, c) => Skee$Synth$hot_spot_voices(c) };

function Skee$Synth$jackpot_voices(c) {
  {
    let $t63899;
    $t63899 = { $: "$Clo_$lam0_Skee_Synth_jackpot_voices$0_Skee_Synth_jackpot_voices", _0: $lam0_Skee_Synth_jackpot_voices$apply$0_Skee_Synth_jackpot_voices, _1: c };
    {
      let sparkle;
      {
        const f_i11435 = $t63899;
        {
          const $t63841_i11436 = { $: "Nil" };
          sparkle = Skee$Synth$upto_from(0, 20, f_i11435, $t63841_i11436);
        }
      }
      {
        const $t63900 = { $: "Nil" };
        {
          const $t63901 = { $: "Cons", _0: 2093., _1: $t63900 };
          {
            const $t63902 = { $: "Cons", _0: 1568., _1: $t63901 };
            {
              const $t63903 = { $: "Cons", _0: 1318., _1: $t63902 };
              {
                const $t63904 = { $: "Cons", _0: 1046., _1: $t63903 };
                {
                  const $t63905 = { $: "Cons", _0: 784., _1: $t63904 };
                  {
                    const $t63906 = { $: "Cons", _0: 659., _1: $t63905 };
                    {
                      const $t63907 = { $: "Cons", _0: 523., _1: $t63906 };
                      {
                        const $t63908 = { $: "WaveTri" };
                        {
                          let $t63909;
                          {
                            const $t63823_i11433 = { $: "Nil" };
                            $t63909 = Skee$Synth$arpeggio_from(c, $t63907, 0, 0.055, 0.25, 0.3, $t63908, $t63823_i11433);
                          }
                          {
                            let $t63910;
                            $t63910 = Skee$Synth$bell(c, 1046., 0.35, 0.4);
                            {
                              const $t63911 = Skee$Synth$bell(c, 1568., 0.25, 0.45);
                              {
                                const $t63912 = { $: "Nil" };
                                {
                                  const $t63913 = { $: "Cons", _0: sparkle, _1: $t63912 };
                                  {
                                    const $t63914 = { $: "Cons", _0: $t63911, _1: $t63913 };
                                    {
                                      const $t63915 = { $: "Cons", _0: $t63910, _1: $t63914 };
                                      {
                                        const $t63916 = { $: "Cons", _0: $t63909, _1: $t63915 };
                                        {
                                          const prepend_reversed_i11424 = { $: "$Clo_prepend_reversed$0_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave", _0: prepend_reversed$apply$0_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave };
                                          {
                                            const go_i11425 = { $: "$Clo_go$1_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave", _0: go$apply$1_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave, _1: prepend_reversed_i11424 };
                                            {
                                              const $t2393_i11426 = { $: "Nil" };
                                              return go$apply$1_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(go_i11425, $t63916, $t2393_i11426);
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$jackpot_voices$clo = { _0: ($_, c) => Skee$Synth$jackpot_voices(c) };

function Skee$Synth$lever_voices(c) {
  {
    let $t63923;
    $t63923 = { $: "$Clo_$lam0_Skee_Synth_lever_voices$0_Skee_Synth_lever_voices", _0: $lam0_Skee_Synth_lever_voices$apply$0_Skee_Synth_lever_voices, _1: c };
    {
      let ratchet;
      {
        const f_i11445 = $t63923;
        {
          const $t63841_i11446 = { $: "Nil" };
          ratchet = Skee$Synth$upto_from(0, 6, f_i11445, $t63841_i11446);
        }
      }
      {
        let $t63925;
        {
          const $t63924 = { $: "WaveSine" };
          $t63925 = Skee$Synth$voice(c, $t63924, 90., 60., 0.1, 0.45, 0.12, 0.16);
        }
        {
          let $t63927;
          {
            const $t63926 = { $: "WaveNoise" };
            {
              const $t63805_i11443 = c.default_glide;
              $t63927 = Skee$Synth$voice(c, $t63926, 0., 0., $t63805_i11443, 0.08, 0.05, 0.16);
            }
          }
          {
            const $t63928 = { $: "Nil" };
            {
              const $t63929 = { $: "Cons", _0: $t63927, _1: $t63928 };
              {
                const $t63930 = { $: "Cons", _0: $t63925, _1: $t63929 };
                return List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(ratchet, $t63930);
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$lever_voices$clo = { _0: ($_, c) => Skee$Synth$lever_voices(c) };

function Skee$Synth$pull_win_voices(c, chips) {
  {
    let n;
    {
      let $t63932;
      {
        let $t63931;
        {
          const $t63851_i21450 = (chips < 0);
          if ($t63851_i21450 === true) {
            {
              let $t63853_i21452;
              {
                const $t63852_i21451 = ((0 - chips) < 4611686018427387904 && (0 - chips) >= -4611686018427387904 ? (0 - chips) : march_int_ovf((0 - chips), 1));
                $t63853_i21452 = (($t63852_i21451 - $t63852_i21451 % 15) / 15);
              }
              $t63931 = ((0 - $t63853_i21452) < 4611686018427387904 && (0 - $t63853_i21452) >= -4611686018427387904 ? (0 - $t63853_i21452) : march_int_ovf((0 - $t63853_i21452), 1));
            }
          } else {
            $t63931 = ((chips - chips % 15) / 15);
          }
        }
        $t63932 = ((6 + $t63931) < 4611686018427387904 && (6 + $t63931) >= -4611686018427387904 ? (6 + $t63931) : march_int_ovf((6 + $t63931), 0));
      }
      {
        const $t3742_i11459 = (30 < $t63932);
        if ($t3742_i11459 === true) {
          n = 30;
        } else {
          n = $t63932;
        }
      }
    }
    {
      let $t63941;
      $t63941 = { $: "$Clo_$lam0_Skee_Synth_pull_win_voices$0_Skee_Synth_pull_win_voices", _0: $lam0_Skee_Synth_pull_win_voices$apply$0_Skee_Synth_pull_win_voices, _1: c };
      {
        let rattle;
        {
          const f_i11455 = $t63941;
          {
            const $t63841_i11456 = { $: "Nil" };
            rattle = Skee$Synth$upto_from(0, n, f_i11455, $t63841_i11456);
          }
        }
        {
          const $t63942 = { $: "Nil" };
          {
            const $t63943 = { $: "Cons", _0: 1175., _1: $t63942 };
            {
              const $t63944 = { $: "Cons", _0: 988., _1: $t63943 };
              {
                const $t63945 = { $: "Cons", _0: 784., _1: $t63944 };
                {
                  const $t63946 = { $: "WaveSine" };
                  {
                    let $t63947;
                    {
                      const $t63823_i11453 = { $: "Nil" };
                      $t63947 = Skee$Synth$arpeggio_from(c, $t63945, 0, 0.07, 0.2, 0.12, $t63946, $t63823_i11453);
                    }
                    return List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($t63947, rattle);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$pull_win_voices$clo = { _0: ($_, c, chips) => Skee$Synth$pull_win_voices(c, chips) };

function Skee$Synth$banner_voices(c, text) {
  {
    const $t63948 = (text === "CLEARED");
    if ($t63948 === true) {
      {
        let $t63952;
        $t63952 = { $: "$Clo_$lam0_Skee_Synth_banner_voices$0_Skee_Synth_banner_voices", _0: $lam0_Skee_Synth_banner_voices$apply$0_Skee_Synth_banner_voices, _1: c };
        {
          let ticks;
          {
            const f_i11501 = $t63952;
            {
              const $t63841_i11502 = { $: "Nil" };
              ticks = Skee$Synth$upto_from(0, 16, f_i11501, $t63841_i11502);
            }
          }
          {
            const $t63953 = { $: "Nil" };
            {
              const $t63954 = { $: "Cons", _0: 1046., _1: $t63953 };
              {
                const $t63955 = { $: "Cons", _0: 784., _1: $t63954 };
                {
                  const $t63956 = { $: "Cons", _0: 659., _1: $t63955 };
                  {
                    const $t63957 = { $: "Cons", _0: 523., _1: $t63956 };
                    {
                      const $t63958 = { $: "Cons", _0: 392., _1: $t63957 };
                      {
                        const $t63959 = { $: "WaveSine" };
                        {
                          let $t63960;
                          {
                            const $t63823_i11499 = { $: "Nil" };
                            $t63960 = Skee$Synth$arpeggio_from(c, $t63958, 0, 0.08, 0.22, 0.25, $t63959, $t63823_i11499);
                          }
                          return List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($t63960, ticks);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      {
        const $t63961 = (text === "FREE GAMES");
        if ($t63961 === true) {
          {
            const $t63962 = { $: "Nil" };
            {
              const $t63963 = { $: "Cons", _0: 1568., _1: $t63962 };
              {
                const $t63964 = { $: "Cons", _0: 1318., _1: $t63963 };
                {
                  const $t63965 = { $: "Cons", _0: 1046., _1: $t63964 };
                  {
                    const $t63966 = { $: "Cons", _0: 784., _1: $t63965 };
                    {
                      const $t63967 = { $: "Cons", _0: 1046., _1: $t63966 };
                      {
                        const $t63968 = { $: "Cons", _0: 784., _1: $t63967 };
                        {
                          const $t63969 = { $: "Cons", _0: 659., _1: $t63968 };
                          {
                            const $t63970 = { $: "Cons", _0: 523., _1: $t63969 };
                            {
                              const $t63971 = { $: "WaveSquare" };
                              {
                                const $t63823_i11492 = { $: "Nil" };
                                return Skee$Synth$arpeggio_from(c, $t63970, 0, 0.07, 0.22, 0.2, $t63971, $t63823_i11492);
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          {
            const $t63972 = march_string_ends_with(text, "JACKPOT");
            if ($t63972 === true) {
              {
                let $t63980;
                $t63980 = { $: "$Clo_$lam1_Skee_Synth_banner_voices$1_Skee_Synth_banner_voices", _0: $lam1_Skee_Synth_banner_voices$apply$1_Skee_Synth_banner_voices, _1: c };
                {
                  let shower;
                  {
                    const f_i11482 = $t63980;
                    {
                      const $t63841_i11483 = { $: "Nil" };
                      shower = Skee$Synth$upto_from(0, 40, f_i11482, $t63841_i11483);
                    }
                  }
                  {
                    const $t63981 = { $: "Nil" };
                    {
                      const $t63982 = { $: "Cons", _0: 2637., _1: $t63981 };
                      {
                        const $t63983 = { $: "Cons", _0: 2093., _1: $t63982 };
                        {
                          const $t63984 = { $: "Cons", _0: 1568., _1: $t63983 };
                          {
                            const $t63985 = { $: "Cons", _0: 1318., _1: $t63984 };
                            {
                              const $t63986 = { $: "Cons", _0: 1046., _1: $t63985 };
                              {
                                const $t63987 = { $: "Cons", _0: 784., _1: $t63986 };
                                {
                                  const $t63988 = { $: "Cons", _0: 659., _1: $t63987 };
                                  {
                                    const $t63989 = { $: "Cons", _0: 523., _1: $t63988 };
                                    {
                                      const $t63990 = { $: "WaveTri" };
                                      {
                                        let $t63991;
                                        {
                                          const $t63823_i11480 = { $: "Nil" };
                                          $t63991 = Skee$Synth$arpeggio_from(c, $t63989, 0, 0.06, 0.25, 0.35, $t63990, $t63823_i11480);
                                        }
                                        return List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($t63991, shower);
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              {
                const $t63992 = (text === "GAME OVER");
                if ($t63992 === true) {
                  {
                    const $t63993 = { $: "Nil" };
                    {
                      const $t63994 = { $: "Cons", _0: 294., _1: $t63993 };
                      {
                        const $t63995 = { $: "Cons", _0: 349., _1: $t63994 };
                        {
                          const $t63996 = { $: "Cons", _0: 370., _1: $t63995 };
                          {
                            const $t63997 = { $: "Cons", _0: 392., _1: $t63996 };
                            {
                              const $t63998 = { $: "WaveSquare" };
                              {
                                const $t63823_i11473 = { $: "Nil" };
                                return Skee$Synth$arpeggio_from(c, $t63997, 0, 0.3, 0.15, 0.4, $t63998, $t63823_i11473);
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                } else {
                  {
                    const $t63999 = (text === "FEVER");
                    if ($t63999 === true) {
                      {
                        let $t64001;
                        {
                          const $t64000 = { $: "WaveSquare" };
                          $t64001 = Skee$Synth$voice(c, $t64000, 300., 1200., 0.5, 0.1, 0.4, 0.);
                        }
                        {
                          const $t64002 = Skee$Synth$bell(c, 1568., 0.2, 0.5);
                          return { $: "Cons", _0: $t64001, _1: $t64002 };
                        }
                      }
                    } else {
                      return Skee$Synth$bell(c, 784., 0.18, 0.);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$banner_voices$clo = { _0: ($_, c, text) => Skee$Synth$banner_voices(c, text) };

function Skee$Synth$hump_voices(c) {
  {
    let $t64010;
    {
      const $t64009 = { $: "WaveSine" };
      $t64010 = Skee$Synth$voice(c, $t64009, 170., 120., 0.08, 0.55, 0.07, 0.);
    }
    {
      let $t64012;
      {
        const $t64011 = { $: "WaveTri" };
        {
          const $t63804_i11528 = c.default_glide;
          $t64012 = Skee$Synth$voice(c, $t64011, 950., 950., $t63804_i11528, 0.18, 0.015, 0.);
        }
      }
      {
        let $t64014;
        {
          const $t64013 = { $: "WaveNoise" };
          {
            const $t63804_i11522 = c.default_glide;
            $t64014 = Skee$Synth$voice(c, $t64013, 0., 0., $t63804_i11522, 0.08, 0.02, 0.);
          }
        }
        {
          const $t64015 = { $: "Nil" };
          {
            const $t64016 = { $: "Cons", _0: $t64014, _1: $t64015 };
            {
              const $t64017 = { $: "Cons", _0: $t64012, _1: $t64016 };
              return { $: "Cons", _0: $t64010, _1: $t64017 };
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$hump_voices$clo = { _0: ($_, c) => Skee$Synth$hump_voices(c) };

function Skee$Synth$voices_for(c, snd) {
  switch (snd.$) {
    case "SndLaunch": {
      {
        let $t64019;
        {
          const $t64018 = { $: "WaveNoise" };
          {
            const $t63804_i11548 = c.default_glide;
            $t64019 = Skee$Synth$voice(c, $t64018, 0., 0., $t63804_i11548, 0.12, 0.08, 0.);
          }
        }
        {
          let $t64021;
          {
            const $t64020 = { $: "WaveSine" };
            $t64021 = Skee$Synth$voice(c, $t64020, 180., 320., 0.12, 0.15, 0.08, 0.);
          }
          {
            const $t64022 = { $: "Nil" };
            {
              const $t64023 = { $: "Cons", _0: $t64021, _1: $t64022 };
              return { $: "Cons", _0: $t64019, _1: $t64023 };
            }
          }
        }
      }
      break;
    }
    case "SndWhoosh": {
      {
        let $t64025;
        {
          const $t64024 = { $: "WaveNoise" };
          {
            const $t63804_i11561 = c.default_glide;
            $t64025 = Skee$Synth$voice(c, $t64024, 0., 0., $t63804_i11561, 0.16, 0.3, 0.);
          }
        }
        {
          let $t64027;
          {
            const $t64026 = { $: "WaveSine" };
            $t64027 = Skee$Synth$voice(c, $t64026, 900., 180., 0.5, 0.2, 0.3, 0.);
          }
          {
            const $t64028 = { $: "Nil" };
            {
              const $t64029 = { $: "Cons", _0: $t64027, _1: $t64028 };
              return { $: "Cons", _0: $t64025, _1: $t64029 };
            }
          }
        }
      }
      break;
    }
    case "SndHotSpot": {
      return Skee$Synth$hot_spot_voices(c);
      break;
    }
    case "SndHop": {
      {
        const c_i25546 = c;
        {
          let $t64004_i25548;
          {
            const $t64003_i25547 = { $: "WaveSine" };
            $t64004_i25548 = Skee$Synth$voice(c, $t64003_i25547, 220., 780., 0.09, 0.3, 0.12, 0.);
          }
          {
            let $t64006_i25550;
            {
              const $t64005_i25549 = { $: "WaveTri" };
              $t64006_i25550 = Skee$Synth$voice(c, $t64005_i25549, 440., 1100., 0.09, 0.1, 0.08, 0.);
            }
            {
              const $t64007_i25551 = { $: "Nil" };
              {
                const $t64008_i25552 = { $: "Cons", _0: $t64006_i25550, _1: $t64007_i25551 };
                return { $: "Cons", _0: $t64004_i25548, _1: $t64008_i25552 };
              }
            }
          }
        }
      }
      break;
    }
    case "SndRail": {
      {
        let $t64031;
        {
          const $t64030 = { $: "WaveTri" };
          {
            const $t63804_i11567 = c.default_glide;
            $t64031 = Skee$Synth$voice(c, $t64030, 900., 900., $t63804_i11567, 0.15, 0.03, 0.);
          }
        }
        {
          const $t64032 = { $: "Nil" };
          return { $: "Cons", _0: $t64031, _1: $t64032 };
        }
      }
      break;
    }
    case "SndHump": {
      return Skee$Synth$hump_voices(c);
      break;
    }
    case "SndLip": {
      {
        let $t64034;
        {
          const $t64033 = { $: "WaveTri" };
          {
            const $t63804_i11580 = c.default_glide;
            $t64034 = Skee$Synth$voice(c, $t64033, 1900., 1900., $t63804_i11580, 0.2, 0.02, 0.);
          }
        }
        {
          let $t64036;
          {
            const $t64035 = { $: "WaveTri" };
            {
              const $t63805_i11574 = c.default_glide;
              $t64036 = Skee$Synth$voice(c, $t64035, 2300., 2300., $t63805_i11574, 0.16, 0.02, 0.035);
            }
          }
          {
            const $t64037 = { $: "Nil" };
            {
              const $t64038 = { $: "Cons", _0: $t64036, _1: $t64037 };
              return { $: "Cons", _0: $t64034, _1: $t64038 };
            }
          }
        }
      }
      break;
    }
    case "SndBackwall": {
      {
        let $t64040;
        {
          const $t64039 = { $: "WaveSine" };
          {
            const $t63806_i11593 = c.default_glide;
            $t64040 = Skee$Synth$voice(c, $t64039, 110., 80., $t63806_i11593, 0.4, 0.12, 0.);
          }
        }
        {
          let $t64042;
          {
            const $t64041 = { $: "WaveNoise" };
            {
              const $t63804_i11586 = c.default_glide;
              $t64042 = Skee$Synth$voice(c, $t64041, 0., 0., $t63804_i11586, 0.06, 0.04, 0.);
            }
          }
          {
            const $t64043 = { $: "Nil" };
            {
              const $t64044 = { $: "Cons", _0: $t64042, _1: $t64043 };
              return { $: "Cons", _0: $t64040, _1: $t64044 };
            }
          }
        }
      }
      break;
    }
    case "SndLanded": {
      {
        let $t64046;
        {
          const $t64045 = { $: "WaveSine" };
          {
            const $t63806_i11600 = c.default_glide;
            $t64046 = Skee$Synth$voice(c, $t64045, 140., 100., $t63806_i11600, 0.3, 0.06, 0.);
          }
        }
        {
          const $t64047 = { $: "Nil" };
          return { $: "Cons", _0: $t64046, _1: $t64047 };
        }
      }
      break;
    }
    case "SndDrop": {
      const $f64093 = snd._0;
      {
        const h = $f64093;
        {
          const $rc_3536 = Skee$Synth$drop_voices(c, h);
          return $rc_3536;
        }
      }
      break;
    }
    case "SndGutter": {
      {
        let $t64049;
        {
          const $t64048 = { $: "WaveSine" };
          $t64049 = Skee$Synth$voice(c, $t64048, 220., 70., 0.45, 0.35, 0.35, 0.);
        }
        {
          let $t64051;
          {
            const $t64050 = { $: "WaveNoise" };
            {
              const $t63804_i11606 = c.default_glide;
              $t64051 = Skee$Synth$voice(c, $t64050, 0., 0., $t63804_i11606, 0.05, 0.1, 0.);
            }
          }
          {
            const $t64052 = { $: "Nil" };
            {
              const $t64053 = { $: "Cons", _0: $t64051, _1: $t64052 };
              return { $: "Cons", _0: $t64049, _1: $t64053 };
            }
          }
        }
      }
      break;
    }
    case "SndReelTick": {
      {
        let $t64055;
        {
          const $t64054 = { $: "WaveTri" };
          {
            const $t63804_i11619 = c.default_glide;
            $t64055 = Skee$Synth$voice(c, $t64054, 2600., 2600., $t63804_i11619, 0.07, 0.012, 0.);
          }
        }
        {
          const $t64056 = { $: "Nil" };
          return { $: "Cons", _0: $t64055, _1: $t64056 };
        }
      }
      break;
    }
    case "SndReelStop": {
      {
        let $t64058;
        {
          const $t64057 = { $: "WaveTri" };
          {
            const $t63804_i11631 = c.default_glide;
            $t64058 = Skee$Synth$voice(c, $t64057, 1500., 1500., $t63804_i11631, 0.18, 0.05, 0.);
          }
        }
        {
          let $t64060;
          {
            const $t64059 = { $: "WaveSine" };
            {
              const $t63804_i11625 = c.default_glide;
              $t64060 = Skee$Synth$voice(c, $t64059, 750., 750., $t63804_i11625, 0.12, 0.08, 0.);
            }
          }
          {
            const $t64061 = { $: "Nil" };
            {
              const $t64062 = { $: "Cons", _0: $t64060, _1: $t64061 };
              return { $: "Cons", _0: $t64058, _1: $t64062 };
            }
          }
        }
      }
      break;
    }
    case "SndCombo": {
      const $f64094 = snd._0;
      {
        const n = $f64094;
        return Skee$Synth$combo_voices(c, n);
      }
      break;
    }
    case "SndTallyChips": {
      const $f64095 = snd._0;
      {
        const i = $f64095;
        {
          let $t64066;
          {
            const $t64063 = { $: "WaveSine" };
            {
              let $t64065;
              {
                let $t64064;
                $t64064 = Skee$Synth$tally_step(c, i);
                $t64065 = (440. * $t64064);
              }
              {
                const $t63804_i11637 = c.default_glide;
                $t64066 = Skee$Synth$voice(c, $t64063, $t64065, $t64065, $t63804_i11637, 0.22, 0.07, 0.);
              }
            }
          }
          {
            const $t64067 = { $: "Nil" };
            return { $: "Cons", _0: $t64066, _1: $t64067 };
          }
        }
      }
      break;
    }
    case "SndTallyMult": {
      const $f64096 = snd._0;
      {
        const i = $f64096;
        {
          let $t64071;
          {
            const $t64068 = { $: "WaveSquare" };
            {
              let $t64070;
              {
                let $t64069;
                $t64069 = Skee$Synth$tally_step(c, i);
                $t64070 = (587. * $t64069);
              }
              {
                const $t63804_i11649 = c.default_glide;
                $t64071 = Skee$Synth$voice(c, $t64068, $t64070, $t64070, $t63804_i11649, 0.1, 0.09, 0.);
              }
            }
          }
          {
            let $t64075;
            {
              const $t64072 = { $: "WaveSine" };
              {
                let $t64074;
                {
                  let $t64073;
                  $t64073 = Skee$Synth$tally_step(c, i);
                  $t64074 = (1174. * $t64073);
                }
                {
                  const $t63804_i11643 = c.default_glide;
                  $t64075 = Skee$Synth$voice(c, $t64072, $t64074, $t64074, $t63804_i11643, 0.08, 0.06, 0.);
                }
              }
            }
            {
              const $t64076 = { $: "Nil" };
              {
                const $t64077 = { $: "Cons", _0: $t64075, _1: $t64076 };
                return { $: "Cons", _0: $t64071, _1: $t64077 };
              }
            }
          }
        }
      }
      break;
    }
    case "SndFrameDone": {
      {
        let $t64079;
        {
          const $t64078 = { $: "WaveSine" };
          {
            const $t63804_i11655 = c.default_glide;
            $t64079 = Skee$Synth$voice(c, $t64078, 392., 392., $t63804_i11655, 0.2, 0.15, 0.);
          }
        }
        {
          const $t64080 = { $: "Nil" };
          return { $: "Cons", _0: $t64079, _1: $t64080 };
        }
      }
      break;
    }
    case "SndLineWon": {
      {
        const $t64081 = { $: "Nil" };
        {
          const $t64082 = { $: "Cons", _0: 1046., _1: $t64081 };
          {
            const $t64083 = { $: "Cons", _0: 784., _1: $t64082 };
            {
              const $t64084 = { $: "Cons", _0: 659., _1: $t64083 };
              {
                const $t64085 = { $: "Cons", _0: 523., _1: $t64084 };
                {
                  const $t64086 = { $: "WaveSine" };
                  {
                    const $t63823_i11662 = { $: "Nil" };
                    return Skee$Synth$arpeggio_from(c, $t64085, 0, 0.06, 0.22, 0.18, $t64086, $t63823_i11662);
                  }
                }
              }
            }
          }
        }
      }
      break;
    }
    case "SndJackpot": {
      return Skee$Synth$jackpot_voices(c);
      break;
    }
    case "SndBanner": {
      const $f64097 = snd._0;
      {
        const text = $f64097;
        {
          const $rc_3537 = Skee$Synth$banner_voices(c, text);
          return $rc_3537;
        }
      }
      break;
    }
    case "SndLever": {
      return Skee$Synth$lever_voices(c);
      break;
    }
    case "SndPullWin": {
      const $f64098 = snd._0;
      {
        const chips = $f64098;
        return Skee$Synth$pull_win_voices(c, chips);
      }
      break;
    }
    case "SndFoul": {
      {
        let $t64088;
        {
          const $t64087 = { $: "WaveSquare" };
          {
            const $t63804_i11674 = c.default_glide;
            $t64088 = Skee$Synth$voice(c, $t64087, 110., 110., $t63804_i11674, 0.25, 0.3, 0.);
          }
        }
        {
          let $t64090;
          {
            const $t64089 = { $: "WaveSquare" };
            {
              const $t63804_i11668 = c.default_glide;
              $t64090 = Skee$Synth$voice(c, $t64089, 104., 104., $t63804_i11668, 0.2, 0.3, 0.);
            }
          }
          {
            const $t64091 = { $: "Nil" };
            {
              const $t64092 = { $: "Cons", _0: $t64090, _1: $t64091 };
              return { $: "Cons", _0: $t64088, _1: $t64092 };
            }
          }
        }
      }
      break;
    }
    default: {
      return (() => { throw new Error("non-exhaustive pattern match"); })();
    }
  }
}
const Skee$Synth$voices_for$clo = { _0: ($_, c, snd) => Skee$Synth$voices_for(c, snd) };

function Skee$Synth$next_seed(seed) {
  {
    let $t64107;
    {
      const $t64106 = ((seed * 1664525) < 4611686018427387904 && (seed * 1664525) >= -4611686018427387904 ? (seed * 1664525) : march_int_ovf((seed * 1664525), 2));
      $t64107 = (($t64106 + 1013904223) < 4611686018427387904 && ($t64106 + 1013904223) >= -4611686018427387904 ? ($t64106 + 1013904223) : march_int_ovf(($t64106 + 1013904223), 0));
    }
    return ($t64107 % 4294967296);
  }
}
const Skee$Synth$next_seed$clo = { _0: ($_, seed) => Skee$Synth$next_seed(seed) };

function Skee$Synth$noise_of(seed) {
  {
    let $t64111;
    {
      let $t64110;
      {
        let $t64109;
        {
          const $t64108 = ((seed - seed % 512) / 512);
          $t64109 = $t64108;
        }
        $t64110 = ($t64109 / 8388608.);
      }
      $t64111 = ($t64110 * 2.);
    }
    return ($t64111 - 1.);
  }
}
const Skee$Synth$noise_of$clo = { _0: ($_, seed) => Skee$Synth$noise_of(seed) };

function Skee$Synth$oscillate(c, w, phase, seed) {
  switch (w.$) {
    case "WaveSine": {
      {
        let $t64116;
        {
          let $t64115;
          {
            let $t64114;
            {
              const $t64112 = (phase * 2.);
              {
                const $t64113 = c.pi;
                $t64114 = ($t64112 * $t64113);
              }
            }
            $t64115 = Skee$Synth$f32(c, $t64114);
          }
          {
            const $t63787_i11678 = Math.sin($t64115);
            $t64116 = Skee$Synth$f32(c, $t63787_i11678);
          }
        }
        return { _0: $t64116, _1: seed };
      }
      break;
    }
    case "WaveSquare": {
      {
        let $t64119;
        {
          const $t64117 = (phase < 0.5);
          if ($t64117 === true) {
            $t64119 = c.square_level;
          } else {
            {
              const $t64118 = c.square_level;
              $t64119 = (0. - $t64118);
            }
          }
        }
        return { _0: $t64119, _1: seed };
      }
      break;
    }
    case "WaveTri": {
      {
        let centred;
        {
          const $t64120 = (phase - 0.5);
          centred = Skee$Synth$f32(c, $t64120);
        }
        {
          let folded;
          {
            const $t64121 = (centred < 0.);
            if ($t64121 === true) {
              folded = (0. - centred);
            } else {
              folded = centred;
            }
          }
          {
            let $t64125;
            {
              let $t64124;
              {
                let $t64123;
                {
                  const $t64122 = (4. * folded);
                  $t64123 = Skee$Synth$f32(c, $t64122);
                }
                $t64124 = ($t64123 - 1.);
              }
              $t64125 = Skee$Synth$f32(c, $t64124);
            }
            return { _0: $t64125, _1: seed };
          }
        }
      }
      break;
    }
    case "WaveNoise": {
      {
        const next = Skee$Synth$next_seed(seed);
        {
          const $t64126 = Skee$Synth$noise_of(next);
          return { _0: $t64126, _1: next };
        }
      }
      break;
    }
    default: {
      return (() => { throw new Error("non-exhaustive pattern match"); })();
    }
  }
}
const Skee$Synth$oscillate$clo = { _0: ($_, c, w, phase, seed) => Skee$Synth$oscillate(c, w, phase, seed) };

function Skee$Synth$sound_voice(c, v, m) {
  {
    let f;
    {
      let $t64139;
      {
        const $t64127 = v.freq;
        {
          let $t64138;
          {
            let $t64137;
            {
              let $t64131;
              {
                let $t64130;
                {
                  const $t64128 = v.freq_end;
                  {
                    const $t64129 = v.freq;
                    $t64130 = ($t64128 - $t64129);
                  }
                }
                $t64131 = Skee$Synth$f32(c, $t64130);
              }
              {
                let $t64136;
                {
                  let $t64135;
                  {
                    let $t64134;
                    {
                      const $t64132 = v.t;
                      {
                        const $t64133 = v.glide_floor;
                        $t64134 = ($t64132 / $t64133);
                      }
                    }
                    $t64135 = Skee$Synth$f32(c, $t64134);
                  }
                  {
                    const $t47994_i11687 = ($t64135 < 1.);
                    if ($t47994_i11687 === true) {
                      $t64136 = $t64135;
                    } else {
                      $t64136 = 1.;
                    }
                  }
                }
                $t64137 = ($t64131 * $t64136);
              }
            }
            $t64138 = Skee$Synth$f32(c, $t64137);
          }
          $t64139 = ($t64127 + $t64138);
        }
      }
      f = Skee$Synth$f32(c, $t64139);
    }
    {
      let stepped;
      {
        let $t64144;
        {
          const $t64140 = v.phase;
          {
            let $t64143;
            {
              let $t64142;
              {
                const $t64141 = c.dt;
                $t64142 = (f * $t64141);
              }
              $t64143 = Skee$Synth$f32(c, $t64142);
            }
            $t64144 = ($t64140 + $t64143);
          }
        }
        stepped = Skee$Synth$f32(c, $t64144);
      }
      {
        let phase;
        {
          const $t64145 = (stepped > 1.);
          if ($t64145 === true) {
            {
              const $t64146 = (stepped - 1.);
              phase = Skee$Synth$f32(c, $t64146);
            }
          } else {
            phase = stepped;
          }
        }
        {
          let $p64174;
          {
            const $t64147 = v.wave;
            {
              const $t64148 = m.mix_seed;
              $p64174 = Skee$Synth$oscillate(c, $t64147, phase, $t64148);
            }
          }
          {
            const osc = $p64174._0;
            {
              const seed = $p64174._1;
              {
                let attack;
                {
                  let $t64152;
                  {
                    let $t64151;
                    {
                      const $t64149 = v.t;
                      {
                        const $t64150 = c.attack_time;
                        $t64151 = ($t64149 / $t64150);
                      }
                    }
                    $t64152 = Skee$Synth$f32(c, $t64151);
                  }
                  {
                    const $t47994_i11684 = ($t64152 < 1.);
                    if ($t47994_i11684 === true) {
                      attack = $t64152;
                    } else {
                      attack = 1.;
                    }
                  }
                }
                {
                  let envelope;
                  {
                    let $t64157;
                    {
                      let $t64156;
                      {
                        let $t64154;
                        {
                          const $t64153 = v.t;
                          $t64154 = (0. - $t64153);
                        }
                        {
                          const $t64155 = v.decay;
                          $t64156 = ($t64154 / $t64155);
                        }
                      }
                      $t64157 = Skee$Synth$f32(c, $t64156);
                    }
                    {
                      const $t63788_i11681 = Math.exp($t64157);
                      envelope = Skee$Synth$f32(c, $t63788_i11681);
                    }
                  }
                  {
                    let level;
                    {
                      let $t64166;
                      {
                        const $t64158 = m.level;
                        {
                          let $t64165;
                          {
                            let $t64164;
                            {
                              let $t64163;
                              {
                                let $t64162;
                                {
                                  let $t64161;
                                  {
                                    let $t64160;
                                    {
                                      const $t64159 = v.amp;
                                      $t64160 = (osc * $t64159);
                                    }
                                    $t64161 = Skee$Synth$f32(c, $t64160);
                                  }
                                  $t64162 = ($t64161 * attack);
                                }
                                $t64163 = Skee$Synth$f32(c, $t64162);
                              }
                              $t64164 = ($t64163 * envelope);
                            }
                            $t64165 = Skee$Synth$f32(c, $t64164);
                          }
                          $t64166 = ($t64158 + $t64165);
                        }
                      }
                      level = Skee$Synth$f32(c, $t64166);
                    }
                    {
                      let t;
                      {
                        let $t64169;
                        {
                          const $t64167 = v.t;
                          {
                            const $t64168 = c.dt;
                            $t64169 = ($t64167 + $t64168);
                          }
                        }
                        t = Skee$Synth$f32(c, $t64169);
                      }
                      {
                        let $t64171;
                        {
                          const $t64170 = v.life;
                          $t64171 = (t > $t64170);
                        }
                        {
                          let kept;
                          if ($t64171 === true) {
                            {
                              const $rc_3539 = m.kept;
                              kept = $rc_3539;
                            }
                          } else {
                            {
                              const $t64172 = ({ ...v, t: t, phase: phase });
                              {
                                const $t64173 = m.kept;
                                kept = { $: "Cons", _0: $t64172, _1: $t64173 };
                              }
                            }
                          }
                          {
                            const $rc_3541 = ({ level: level, mix_seed: seed, kept: kept });
                            return $rc_3541;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$sound_voice$clo = { _0: ($_, c, v, m) => Skee$Synth$sound_voice(c, v, m) };

function Skee$Synth$mix_voices($tco_a0, $tco_a1, $tco_a2) {
  __tco: for (;;) {
    const c = $tco_a0;
    const vs = $tco_a1;
    const m = $tco_a2;
    switch (vs.$) {
      case "Nil": {
        return m;
        break;
      }
      case "Cons": {
        const $f64186 = vs._0;
        const $f64187 = vs._1;
        {
          const rest = $f64187;
          {
            const v = $f64186;
            {
              let $t64176;
              {
                const $t64175 = v.delay;
                $t64176 = ($t64175 > 0.);
              }
              if ($t64176 === true) {
                {
                  let $t64184;
                  {
                    let $t64181;
                    {
                      let $t64180;
                      {
                        let $t64179;
                        {
                          const $t64177 = v.delay;
                          {
                            const $t64178 = c.dt;
                            $t64179 = ($t64177 - $t64178);
                          }
                        }
                        $t64180 = Skee$Synth$f32(c, $t64179);
                      }
                      $t64181 = ({ ...v, delay: $t64180 });
                    }
                    {
                      const $t64182 = m.kept;
                      {
                        let $t64183;
                        $t64183 = { $: "Cons", _0: $t64181, _1: $t64182 };
                        $t64184 = ({ ...m, kept: $t64183 });
                      }
                    }
                  }
                  {
                    $tco_a0 = c;
                    $tco_a1 = rest;
                    $tco_a2 = $t64184;
                    continue __tco;
                  }
                }
              } else {
                {
                  let $t64185;
                  $t64185 = Skee$Synth$sound_voice(c, v, m);
                  {
                    $tco_a0 = c;
                    $tco_a1 = rest;
                    $tco_a2 = $t64185;
                    continue __tco;
                  }
                }
              }
            }
          }
        }
        break;
      }
      default: {
        return (() => { throw new Error("non-exhaustive pattern match"); })();
      }
    }
    return undefined;
  }
}
const Skee$Synth$mix_voices$clo = { _0: ($_, c, vs, m) => Skee$Synth$mix_voices(c, vs, m) };

function Skee$Synth$drum_roll(s) {
  {
    const $t64192 = s.drum;
    if ($t64192 === true) {
      {
        const c = s.c;
        {
          let clock;
          {
            let $t64195;
            {
              const $t64193 = s.drum_clock;
              {
                const $t64194 = c.dt;
                $t64195 = ($t64193 + $t64194);
              }
            }
            clock = Skee$Synth$f32(c, $t64195);
          }
          {
            let $t64197;
            {
              const $t64196 = c.drum_step;
              $t64197 = (clock > $t64196);
            }
            if ($t64197 === true) {
              {
                const $t64198 = s.voices;
                {
                  let $t64200;
                  {
                    const $t64199 = { $: "WaveNoise" };
                    $t64200 = Skee$Synth$voice(c, $t64199, 0., 0., 1., 0.13, 0.03, 0.);
                  }
                  {
                    const $t64201 = { $: "Nil" };
                    {
                      const $t64202 = { $: "Cons", _0: $t64200, _1: $t64201 };
                      {
                        let $t64203;
                        $t64203 = List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($t64198, $t64202);
                        {
                          const $rc_3543 = ({ ...s, drum_clock: 0., voices: $t64203 });
                          return $rc_3543;
                        }
                      }
                    }
                  }
                }
              }
            } else {
              {
                const $rc_3542 = ({ ...s, drum_clock: clock });
                return $rc_3542;
              }
            }
          }
        }
      }
    } else {
      return s;
    }
  }
}
const Skee$Synth$drum_roll$clo = { _0: ($_, s) => Skee$Synth$drum_roll(s) };

function Skee$Synth$next_sample(s) {
  {
    const c = s.c;
    {
      let rumble;
      {
        let $t64213;
        {
          const $t64205 = s.rumble;
          {
            let $t64212;
            {
              let $t64211;
              {
                let $t64209;
                {
                  let $t64208;
                  {
                    const $t64206 = s.rumble_target;
                    {
                      const $t64207 = s.rumble;
                      $t64208 = ($t64206 - $t64207);
                    }
                  }
                  $t64209 = Skee$Synth$f32(c, $t64208);
                }
                {
                  const $t64210 = c.rumble_follow;
                  $t64211 = ($t64209 * $t64210);
                }
              }
              $t64212 = Skee$Synth$f32(c, $t64211);
            }
            $t64213 = ($t64205 + $t64212);
          }
        }
        rumble = Skee$Synth$f32(c, $t64213);
      }
      {
        let seed;
        {
          const $t64214 = s.seed;
          seed = Skee$Synth$next_seed($t64214);
        }
        {
          let lowpass;
          {
            let $t64223;
            {
              const $t64215 = s.lowpass;
              {
                let $t64222;
                {
                  let $t64221;
                  {
                    let $t64219;
                    {
                      let $t64218;
                      {
                        const $t64216 = Skee$Synth$noise_of(seed);
                        {
                          const $t64217 = s.lowpass;
                          $t64218 = ($t64216 - $t64217);
                        }
                      }
                      $t64219 = Skee$Synth$f32(c, $t64218);
                    }
                    {
                      const $t64220 = c.lowpass_follow;
                      $t64221 = ($t64219 * $t64220);
                    }
                  }
                  $t64222 = Skee$Synth$f32(c, $t64221);
                }
                $t64223 = ($t64215 + $t64222);
              }
            }
            lowpass = Skee$Synth$f32(c, $t64223);
          }
          {
            let level;
            {
              let $t64228;
              {
                let $t64227;
                {
                  let $t64225;
                  {
                    const $t64224 = (lowpass * rumble);
                    $t64225 = Skee$Synth$f32(c, $t64224);
                  }
                  {
                    const $t64226 = c.rumble_gain;
                    $t64227 = ($t64225 * $t64226);
                  }
                }
                $t64228 = Skee$Synth$f32(c, $t64227);
              }
              {
                const $t64204_i11697 = ($t64228 === 0.);
                if ($t64204_i11697 === true) {
                  level = 0.;
                } else {
                  level = $t64228;
                }
              }
            }
            {
              let drummed;
              {
                const $t64229 = ({ ...s, rumble: rumble, lowpass: lowpass, seed: seed });
                drummed = Skee$Synth$drum_roll($t64229);
              }
              {
                let m;
                {
                  const $t64230 = drummed.voices;
                  {
                    let $t64232;
                    {
                      const $t64231 = { $: "Nil" };
                      $t64232 = ({ level: level, mix_seed: seed, kept: $t64231 });
                    }
                    m = Skee$Synth$mix_voices(c, $t64230, $t64232);
                  }
                }
                {
                  let out;
                  {
                    const $t64233 = (-1.);
                    {
                      let $t64235;
                      {
                        const $t64234 = m.level;
                        {
                          const $t47994_i11695 = ($t64234 < 1.);
                          if ($t47994_i11695 === true) {
                            $t64235 = $t64234;
                          } else {
                            $t64235 = 1.;
                          }
                        }
                      }
                      {
                        const $t47993_i11692 = ($t64235 >= $t64233);
                        if ($t47993_i11692 === true) {
                          out = $t64235;
                        } else {
                          out = $t64233;
                        }
                      }
                    }
                  }
                  {
                    let $t64239;
                    {
                      const $t64236 = m.mix_seed;
                      {
                        const $t64237 = m.kept;
                        {
                          let $t64238;
                          {
                            const $t2258_i11689 = { $: "Nil" };
                            $t64238 = List$reverse_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($t64237, $t2258_i11689);
                          }
                          $t64239 = ({ ...drummed, seed: $t64236, voices: $t64238 });
                        }
                      }
                    }
                    {
                      const $rc_3545 = { _0: out, _1: $t64239 };
                      return $rc_3545;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
const Skee$Synth$next_sample$clo = { _0: ($_, s) => Skee$Synth$next_sample(s) };

function Skee$Synth$render_into($tco_a0, $tco_a1, $tco_a2) {
  __tco: for (;;) {
    const s = $tco_a0;
    const n = $tco_a1;
    const acc = $tco_a2;
    {
      const $t64240 = (n > 0);
      if ($t64240 === true) {
        {
          const $p64243 = Skee$Synth$next_sample(s);
          {
            const x = $p64243._0;
            {
              const next = $p64243._1;
              {
                const $t64241 = ((n - 1) < 4611686018427387904 && (n - 1) >= -4611686018427387904 ? (n - 1) : march_int_ovf((n - 1), 1));
                {
                  const $t64242 = { $: "Cons", _0: x, _1: acc };
                  {
                    $tco_a0 = next;
                    $tco_a1 = $t64241;
                    $tco_a2 = $t64242;
                    continue __tco;
                  }
                }
              }
            }
          }
        }
      } else {
        {
          let $t64244;
          {
            const $t2258_i11699 = { $: "Nil" };
            $t64244 = List$reverse_onto$List_Float$List_Float(acc, $t2258_i11699);
          }
          return { _0: $t64244, _1: s };
        }
      }
    }
    return undefined;
  }
}
const Skee$Synth$render_into$clo = { _0: ($_, s, n, acc) => Skee$Synth$render_into(s, n, acc) };

function SynthEngine$reset() {
  {
    let $t64912;
    {
      const $t63790_i12035 = { $: "Nil" };
      {
        const $t63791_i12036 = Skee$Synth$consts();
        $t64912 = ({ voices: $t63790_i12035, lowpass: 0., rumble: 0., drum_clock: 0., seed: 22222, rumble_target: 0., drum: false, c: $t63791_i12036 });
      }
    }
    {
      const $rc_3620 = synth_cell_put$clo._0(synth_cell_put$clo, $t64912);
      return $rc_3620;
    }
  }
}
const SynthEngine$reset$clo = { _0: ($_) => SynthEngine$reset() };

function SynthEngine$serve(cmds) {
  {
    let $p64915;
    {
      const $t64913 = synth_cell_get();
      {
        let $t64251_i12040;
        {
          const $t64250_i24958 = { $: "$Clo_$lam0_Skee_SynthFeed_obey_all$0_Skee_SynthFeed_obey_all", _0: $lam0_Skee_SynthFeed_obey_all$apply$0_Skee_SynthFeed_obey_all };
          $t64251_i12040 = List$fold_left$List_AudioCmd$R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Fn_R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave_AudioCmd_R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(cmds, $t64913, $t64250_i24958);
        }
        {
          const $t64245_i24955 = { $: "Nil" };
          $p64915 = Skee$Synth$render_into($t64251_i12040, 128, $t64245_i24955);
        }
      }
    }
    {
      const out = $p64915._0;
      {
        const next = $p64915._1;
        synth_cell_put$clo._0(synth_cell_put$clo, next);
        return out;
      }
    }
  }
}
const SynthEngine$serve$clo = { _0: ($_, cmds) => SynthEngine$serve(cmds) };

function main(_f) {
  {
    const $t64917 = { $: "$Clo_$lam0_main$0_main", _0: $lam0_main$apply$0_main };
    {
      const $t64919 = { $: "$Clo_$lam1_main$1_main", _0: $lam1_main$apply$1_main };
      return worklet_register$clo._0(worklet_register$clo, $t64917, $t64919);
    }
  }
}
const main$clo = { _0: ($_, _f) => main(_f) };

function panic(msg) {
  return (() => { throw new Error(msg); })();
}
const panic$clo = { _0: ($_, msg) => panic(msg) };

function unreachable() {
  return (() => { throw new Error("panic"); })();
}
const unreachable$clo = { _0: ($_) => unreachable() };

function List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(xs, ys) {
  switch (xs.$) {
    case "Nil": {
      return ys;
      break;
    }
    case "Cons": {
      const $f2267 = xs._0;
      const $f2268 = xs._1;
      {
        const t = $f2268;
        {
          const h = $f2267;
          {
            const $trmc11 = { $: "Cons", _0: h, _1: null };
            List$append$dps$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(t, ys, $trmc11);
            return $trmc11;
          }
        }
      }
      break;
    }
    default: {
      return (() => { throw new Error("non-exhaustive pattern match"); })();
    }
  }
}
const List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$clo = { _0: ($_, xs, ys) => List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(xs, ys) };

function List$drop$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Int($tco_a0, $tco_a1) {
  __tco: for (;;) {
    const xs = $tco_a0;
    const n = $tco_a1;
    {
      const $t2516 = (n <= 0);
      if ($t2516 === true) {
        return xs;
      } else {
        switch (xs.$) {
          case "Nil": {
            return { $: "Nil" };
            break;
          }
          case "Cons": {
            const $f2518 = xs._0;
            const $f2519 = xs._1;
            {
              const t = $f2519;
              {
                const $t2517 = ((n - 1) < 4611686018427387904 && (n - 1) >= -4611686018427387904 ? (n - 1) : march_int_ovf((n - 1), 1));
                {
                  $tco_a0 = t;
                  $tco_a1 = $t2517;
                  continue __tco;
                }
              }
            }
            break;
          }
          default: {
            return (() => { throw new Error("non-exhaustive pattern match"); })();
          }
        }
      }
    }
    return undefined;
  }
}
const List$drop$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Int$clo = { _0: ($_, xs, n) => List$drop$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Int(xs, n) };

function List$fold_left$List_AudioCmd$R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Fn_R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave_AudioCmd_R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($tco_a0, $tco_a1, $tco_a2) {
  __tco: for (;;) {
    const xs = $tco_a0;
    const acc = $tco_a1;
    const f = $tco_a2;
    switch (xs.$) {
      case "Nil": {
        return acc;
        break;
      }
      case "Cons": {
        const $f2361 = xs._0;
        const $f2362 = xs._1;
        {
          const t = $f2362;
          {
            const h = $f2361;
            {
              let $t2360;
              $t2360 = f._0(f, acc, h);
              {
                $tco_a0 = t;
                $tco_a1 = $t2360;
                $tco_a2 = f;
                continue __tco;
              }
            }
          }
        }
        break;
      }
      default: {
        return (() => { throw new Error("non-exhaustive pattern match"); })();
      }
    }
    return undefined;
  }
}
const List$fold_left$List_AudioCmd$R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Fn_R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave_AudioCmd_R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$clo = { _0: ($_, xs, acc, f) => List$fold_left$List_AudioCmd$R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Fn_R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave_AudioCmd_R_c_R_attack_time_Float_default_glide_Float_drum_step_Float_dt_Float_infinity_Float_lowpass_follow_Float_min_glide_Float_overflow_Float_pi_Float_rumble_follow_Float_rumble_gain_Float_split_Float_square_level_Float_subnormal_shift_Float_tiny_Float_drum_Bool_drum_clock_Float_lowpass_Float_rumble_Float_rumble_target_Float_seed_Int_voices_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(xs, acc, f) };

function List$reverse_onto$List_Float$List_Float($tco_a0, $tco_a1) {
  __tco: for (;;) {
    const lst = $tco_a0;
    const acc = $tco_a1;
    switch (lst.$) {
      case "Nil": {
        return acc;
        break;
      }
      case "Cons": {
        const $f2260 = lst._0;
        const $f2261 = lst._1;
        {
          const t = $f2261;
          {
            const h = $f2260;
            {
              const $t2259 = { $: "Cons", _0: h, _1: acc };
              {
                $tco_a0 = t;
                $tco_a1 = $t2259;
                continue __tco;
              }
            }
          }
        }
        break;
      }
      default: {
        return (() => { throw new Error("non-exhaustive pattern match"); })();
      }
    }
    return undefined;
  }
}
const List$reverse_onto$List_Float$List_Float$clo = { _0: ($_, lst, acc) => List$reverse_onto$List_Float$List_Float(lst, acc) };

function List$length_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Int($tco_a0, $tco_a1) {
  __tco: for (;;) {
    const lst = $tco_a0;
    const acc = $tco_a1;
    switch (lst.$) {
      case "Nil": {
        return acc;
        break;
      }
      case "Cons": {
        const $f2252 = lst._0;
        const $f2253 = lst._1;
        {
          const t = $f2253;
          {
            const $t2251 = ((acc + 1) < 4611686018427387904 && (acc + 1) >= -4611686018427387904 ? (acc + 1) : march_int_ovf((acc + 1), 0));
            {
              $tco_a0 = t;
              $tco_a1 = $t2251;
              continue __tco;
            }
          }
        }
        break;
      }
      default: {
        return (() => { throw new Error("non-exhaustive pattern match"); })();
      }
    }
    return undefined;
  }
}
const List$length_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Int$clo = { _0: ($_, lst, acc) => List$length_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Int(lst, acc) };

function List$reverse_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($tco_a0, $tco_a1) {
  __tco: for (;;) {
    const lst = $tco_a0;
    const acc = $tco_a1;
    switch (lst.$) {
      case "Nil": {
        return acc;
        break;
      }
      case "Cons": {
        const $f2260 = lst._0;
        const $f2261 = lst._1;
        {
          const t = $f2261;
          {
            const h = $f2260;
            {
              const $t2259 = { $: "Cons", _0: h, _1: acc };
              {
                $tco_a0 = t;
                $tco_a1 = $t2259;
                continue __tco;
              }
            }
          }
        }
        break;
      }
      default: {
        return (() => { throw new Error("non-exhaustive pattern match"); })();
      }
    }
    return undefined;
  }
}
const List$reverse_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$clo = { _0: ($_, lst, acc) => List$reverse_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(lst, acc) };

function List$append$dps$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($tco_a0, $tco_a1, $tco_a2) {
  __tco: for (;;) {
    const xs = $tco_a0;
    const ys = $tco_a1;
    const $dst = $tco_a2;
    switch (xs.$) {
      case "Nil": {
        return ($dst._1 = ys, undefined);
        break;
      }
      case "Cons": {
        const $f2267 = xs._0;
        const $f2268 = xs._1;
        {
          const t = $f2268;
          {
            const h = $f2267;
            {
              const $trmc10 = { $: "Cons", _0: h, _1: null };
              ($dst._1 = $trmc10, undefined);
              {
                $tco_a0 = t;
                $tco_a1 = ys;
                $tco_a2 = $trmc10;
                continue __tco;
              }
            }
          }
        }
        break;
      }
      default: {
        {
          const $trmc8 = (() => { throw new Error("non-exhaustive pattern match"); })();
          return ($dst._1 = $trmc8, undefined);
        }
      }
    }
    return undefined;
  }
}
const List$append$dps$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$clo = { _0: ($_, xs, ys, $dst) => List$append$dps$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(xs, ys, $dst) };

function $lam0_Skee_Synth_hot_spot_voices$apply$0_Skee_Synth_hot_spot_voices($clo, i) {
  {
    const c = $clo._1;
    {
      const $t63872 = { $: "WaveTri" };
      {
        let $t63877;
        {
          let $t63876;
          {
            let $t63875;
            {
              let $t63874;
              {
                const $t63873 = ((i * 7) < 4611686018427387904 && (i * 7) >= -4611686018427387904 ? (i * 7) : march_int_ovf((i * 7), 2));
                $t63874 = ($t63873 % 5);
              }
              $t63875 = (($t63874 * 300) < 4611686018427387904 && ($t63874 * 300) >= -4611686018427387904 ? ($t63874 * 300) : march_int_ovf(($t63874 * 300), 2));
            }
            $t63876 = ((2600 + $t63875) < 4611686018427387904 && (2600 + $t63875) >= -4611686018427387904 ? (2600 + $t63875) : march_int_ovf((2600 + $t63875), 0));
          }
          $t63877 = $t63876;
        }
        {
          let $t63878;
          $t63878 = Skee$Synth$after(c, 0.25, i, 0.04);
          {
            const $t63805_i15166 = c.default_glide;
            return Skee$Synth$voice(c, $t63872, $t63877, $t63877, $t63805_i15166, 0.06, 0.025, $t63878);
          }
        }
      }
    }
  }
}
const $lam0_Skee_Synth_hot_spot_voices$apply$0_Skee_Synth_hot_spot_voices$clo = { _0: ($_, $clo, i) => $lam0_Skee_Synth_hot_spot_voices$apply$0_Skee_Synth_hot_spot_voices($clo, i) };

function $lam0_Skee_Synth_jackpot_voices$apply$0_Skee_Synth_jackpot_voices($clo, i) {
  {
    const c = $clo._1;
    {
      const $t63893 = { $: "WaveTri" };
      {
        let $t63897;
        {
          let $t63896;
          {
            let $t63895;
            {
              const $t63894 = (i % 5);
              $t63895 = (($t63894 * 400) < 4611686018427387904 && ($t63894 * 400) >= -4611686018427387904 ? ($t63894 * 400) : march_int_ovf(($t63894 * 400), 2));
            }
            $t63896 = ((3000 + $t63895) < 4611686018427387904 && (3000 + $t63895) >= -4611686018427387904 ? (3000 + $t63895) : march_int_ovf((3000 + $t63895), 0));
          }
          $t63897 = $t63896;
        }
        {
          let $t63898;
          $t63898 = Skee$Synth$after(c, 0.4, i, 0.04);
          {
            const $t63805_i15173 = c.default_glide;
            return Skee$Synth$voice(c, $t63893, $t63897, $t63897, $t63805_i15173, 0.05, 0.03, $t63898);
          }
        }
      }
    }
  }
}
const $lam0_Skee_Synth_jackpot_voices$apply$0_Skee_Synth_jackpot_voices$clo = { _0: ($_, $clo, i) => $lam0_Skee_Synth_jackpot_voices$apply$0_Skee_Synth_jackpot_voices($clo, i) };

function $lam0_Skee_Synth_lever_voices$apply$0_Skee_Synth_lever_voices($clo, i) {
  {
    const c = $clo._1;
    {
      const $t63918 = { $: "WaveTri" };
      {
        let $t63921;
        {
          let $t63920;
          {
            const $t63919 = ((i * 60) < 4611686018427387904 && (i * 60) >= -4611686018427387904 ? (i * 60) : march_int_ovf((i * 60), 2));
            $t63920 = ((1200 - $t63919) < 4611686018427387904 && (1200 - $t63919) >= -4611686018427387904 ? (1200 - $t63919) : march_int_ovf((1200 - $t63919), 1));
          }
          $t63921 = $t63920;
        }
        {
          let $t63922;
          $t63922 = Skee$Synth$times(c, i, 0.025);
          {
            const $t63805_i15180 = c.default_glide;
            return Skee$Synth$voice(c, $t63918, $t63921, $t63921, $t63805_i15180, 0.1, 0.012, $t63922);
          }
        }
      }
    }
  }
}
const $lam0_Skee_Synth_lever_voices$apply$0_Skee_Synth_lever_voices$clo = { _0: ($_, $clo, i) => $lam0_Skee_Synth_lever_voices$apply$0_Skee_Synth_lever_voices($clo, i) };

function $lam0_Skee_Synth_pull_win_voices$apply$0_Skee_Synth_pull_win_voices($clo, i) {
  {
    const c = $clo._1;
    {
      const $t63934 = { $: "WaveTri" };
      {
        let $t63939;
        {
          let $t63938;
          {
            let $t63937;
            {
              let $t63936;
              {
                const $t63935 = ((i * 7) < 4611686018427387904 && (i * 7) >= -4611686018427387904 ? (i * 7) : march_int_ovf((i * 7), 2));
                $t63936 = ($t63935 % 5);
              }
              $t63937 = (($t63936 * 300) < 4611686018427387904 && ($t63936 * 300) >= -4611686018427387904 ? ($t63936 * 300) : march_int_ovf(($t63936 * 300), 2));
            }
            $t63938 = ((2400 + $t63937) < 4611686018427387904 && (2400 + $t63937) >= -4611686018427387904 ? (2400 + $t63937) : march_int_ovf((2400 + $t63937), 0));
          }
          $t63939 = $t63938;
        }
        {
          let $t63940;
          $t63940 = Skee$Synth$after(c, 0.2, i, 0.035);
          {
            const $t63805_i15187 = c.default_glide;
            return Skee$Synth$voice(c, $t63934, $t63939, $t63939, $t63805_i15187, 0.06, 0.02, $t63940);
          }
        }
      }
    }
  }
}
const $lam0_Skee_Synth_pull_win_voices$apply$0_Skee_Synth_pull_win_voices$clo = { _0: ($_, $clo, i) => $lam0_Skee_Synth_pull_win_voices$apply$0_Skee_Synth_pull_win_voices($clo, i) };

function $lam0_Skee_Synth_banner_voices$apply$0_Skee_Synth_banner_voices($clo, i) {
  {
    const c = $clo._1;
    {
      const $t63950 = { $: "WaveTri" };
      {
        let $t63951;
        $t63951 = Skee$Synth$after(c, 0.5, i, 0.045);
        {
          const $t63805_i15194 = c.default_glide;
          return Skee$Synth$voice(c, $t63950, 1800., 1800., $t63805_i15194, 0.08, 0.012, $t63951);
        }
      }
    }
  }
}
const $lam0_Skee_Synth_banner_voices$apply$0_Skee_Synth_banner_voices$clo = { _0: ($_, $clo, i) => $lam0_Skee_Synth_banner_voices$apply$0_Skee_Synth_banner_voices($clo, i) };

function $lam1_Skee_Synth_banner_voices$apply$1_Skee_Synth_banner_voices($clo, i) {
  {
    const c = $clo._1;
    {
      const $t63974 = { $: "WaveTri" };
      {
        let $t63978;
        {
          let $t63977;
          {
            let $t63976;
            {
              const $t63975 = (i % 6);
              $t63976 = (($t63975 * 350) < 4611686018427387904 && ($t63975 * 350) >= -4611686018427387904 ? ($t63975 * 350) : march_int_ovf(($t63975 * 350), 2));
            }
            $t63977 = ((2600 + $t63976) < 4611686018427387904 && (2600 + $t63976) >= -4611686018427387904 ? (2600 + $t63976) : march_int_ovf((2600 + $t63976), 0));
          }
          $t63978 = $t63977;
        }
        {
          let $t63979;
          $t63979 = Skee$Synth$after(c, 0.5, i, 0.04);
          {
            const $t63805_i15201 = c.default_glide;
            return Skee$Synth$voice(c, $t63974, $t63978, $t63978, $t63805_i15201, 0.05, 0.03, $t63979);
          }
        }
      }
    }
  }
}
const $lam1_Skee_Synth_banner_voices$apply$1_Skee_Synth_banner_voices$clo = { _0: ($_, $clo, i) => $lam1_Skee_Synth_banner_voices$apply$1_Skee_Synth_banner_voices($clo, i) };

function $lam0_Skee_SynthFeed_obey_all$apply$0_Skee_SynthFeed_obey_all($clo, acc, cmd) {
  {
    const s_i23437 = acc;
    {
      const cmd_i23438 = cmd;
      switch (cmd_i23438.$) {
        case "CmdPlay": {
          const $f64246_i23439 = cmd_i23438._0;
          {
            const snd_i23440 = $f64246_i23439;
            {
              const $t64104_i25739 = acc.c;
              {
                const $t64105_i25740 = Skee$Synth$voices_for($t64104_i25739, snd_i23440);
                {
                  const s_i21453_i25741 = acc;
                  {
                    const $t64099_i21455_i25742 = acc.voices;
                    {
                      let all_voices_i21456_i25743;
                      all_voices_i21456_i25743 = List$append$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($t64099_i21455_i25742, $t64105_i25740);
                      {
                        let over_i21460_i25745;
                        {
                          let $t64100_i21458_i25744;
                          {  };
                          $t64100_i21458_i25744 = List$length_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Int(all_voices_i21456_i25743, 0);
                          over_i21460_i25745 = (($t64100_i21458_i25744 - 48) < 4611686018427387904 && ($t64100_i21458_i25744 - 48) >= -4611686018427387904 ? ($t64100_i21458_i25744 - 48) : march_int_ovf(($t64100_i21458_i25744 - 48), 1));
                        }
                        {
                          const $t64102_i21461_i25746 = (over_i21460_i25745 > 0);
                          {
                            let $t64103_i21462_i25747;
                            if ($t64102_i21461_i25746 === true) {
                              $t64103_i21462_i25747 = List$drop$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$Int(all_voices_i21456_i25743, over_i21460_i25745);
                            } else {
                              $t64103_i21462_i25747 = all_voices_i21456_i25743;
                            }
                            {
                              const $rc_3538_i21463_i25748 = ({ ...acc, voices: $t64103_i21462_i25747 });
                              return $rc_3538_i21463_i25748;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          break;
        }
        case "CmdRumble": {
          const $f64247_i23441 = cmd_i23438._0;
          {
            const level_i23442 = $f64247_i23441;
            {
              const s_i25749 = acc;
              {
                let $t63793_i25752;
                {
                  const $t63792_i25751 = acc.c;
                  $t63793_i25752 = Skee$Synth$f32($t63792_i25751, level_i23442);
                }
                {
                  const $rc_3531_i25753 = ({ ...acc, rumble_target: $t63793_i25752 });
                  return $rc_3531_i25753;
                }
              }
            }
          }
          break;
        }
        case "CmdDrum": {
          const $f64248_i23443 = cmd_i23438._0;
          {
            const on__i23444 = $f64248_i23443;
            {
              const s_i25754 = acc;
              {
                const $rc_3532_i25756 = ({ ...acc, drum: on__i23444 });
                return $rc_3532_i25756;
              }
            }
          }
          break;
        }
        default: {
          return (() => { throw new Error("non-exhaustive pattern match"); })();
        }
      }
    }
  }
}
const $lam0_Skee_SynthFeed_obey_all$apply$0_Skee_SynthFeed_obey_all$clo = { _0: ($_, $clo, acc, cmd) => $lam0_Skee_SynthFeed_obey_all$apply$0_Skee_SynthFeed_obey_all($clo, acc, cmd) };

function $lam0_main$apply$0_main($clo) {
  return SynthEngine$reset();
}
const $lam0_main$apply$0_main$clo = { _0: ($_, $clo) => $lam0_main$apply$0_main($clo) };

function $lam1_main$apply$1_main($clo, cmds) {
  return SynthEngine$serve(cmds);
}
const $lam1_main$apply$1_main$clo = { _0: ($_, $clo, cmds) => $lam1_main$apply$1_main($clo, cmds) };

function prepend_reversed$apply$0_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($tco_a0, $tco_a1, $tco_a2) {
  __tco: for (;;) {
    const $clo = $tco_a0;
    const sub = $tco_a1;
    const acc = $tco_a2;
    {
      const prepend_reversed = $clo;
      switch (sub.$) {
        case "Nil": {
          return acc;
          break;
        }
        case "Cons": {
          const $f2380 = sub._0;
          const $f2381 = sub._1;
          {
            const rest = $f2381;
            {
              const x = $f2380;
              {
                const $t2379 = { $: "Cons", _0: x, _1: acc };
                {
                  $tco_a0 = $clo;
                  $tco_a1 = rest;
                  $tco_a2 = $t2379;
                  continue __tco;
                }
              }
            }
          }
          break;
        }
        default: {
          return (() => { throw new Error("non-exhaustive pattern match"); })();
        }
      }
    }
    return undefined;
  }
}
const prepend_reversed$apply$0_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$clo = { _0: ($_, $clo, sub, acc) => prepend_reversed$apply$0_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($clo, sub, acc) };

function go$apply$1_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($tco_a0, $tco_a1, $tco_a2) {
  __tco: for (;;) {
    const $clo = $tco_a0;
    const lst = $tco_a1;
    const acc = $tco_a2;
    {
      let go;
      go = $clo;
      {
        const prepend_reversed = $clo._1;
        switch (lst.$) {
          case "Nil": {
            {
              const $t2258_i15444 = { $: "Nil" };
              return List$reverse_onto$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave(acc, $t2258_i15444);
            }
            break;
          }
          case "Cons": {
            const $f2387 = lst._0;
            const $f2388 = lst._1;
            {
              const rest = $f2388;
              {
                const xs = $f2387;
                {
                  let $t2386;
                  $t2386 = prepend_reversed._0(prepend_reversed, xs, acc);
                  {
                    $tco_a0 = go;
                    $tco_a1 = rest;
                    $tco_a2 = $t2386;
                    continue __tco;
                  }
                }
              }
            }
            break;
          }
          default: {
            return (() => { throw new Error("non-exhaustive pattern match"); })();
          }
        }
      }
    }
    return undefined;
  }
}
const go$apply$1_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave$clo = { _0: ($_, $clo, lst, acc) => go$apply$1_List_concat_List_List_R_amp_Float_decay_Float_delay_Float_freq_Float_freq_end_Float_glide_floor_Float_life_Float_phase_Float_t_Float_wave_SynthWave($clo, lst, acc) };

export { main };
main();
//# sourceMappingURL=skee_synth_worklet.mjs.map
