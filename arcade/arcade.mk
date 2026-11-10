# Path variables and build flags for a game built on arcade. Include it from
# the game's Makefile, with ARCADE set to this directory relative to the game
# (default: arcade):
#
#   ARCADE := arcade
#   include $(ARCADE)/arcade.mk
#
# forge puts [deps] and [dev-deps] on MARCH_LIB_PATH by itself, but a build
# that calls march directly (a JS shell outside lib/, the plain-main test
# runners) does not go through forge and must name the engine roots. They are
# defined once here, and exported so the game's scripts see the same values.

ARCADE ?= arcade

# The engine's own lib root (Arcade.*) and the test kit's (Arcade.Test.*). The
# test kit is a dev-dep: put it on test paths only, never on a shipped build.
ARCADE_LIB := $(ARCADE)/lib
ARCADE_TESTKIT_LIB := $(ARCADE)/testkit/lib

# Every JS build turns opt.fold off: the folder bakes a computed Float into a
# literal, which the JS emitter truncates to 12 significant digits. Test
# builds also check that every Int stays JS-safe.
ARCADE_JS_FLAGS := --target js --disable-pass opt.fold
ARCADE_JS_TEST_FLAGS := $(ARCADE_JS_FLAGS) --js-int-check

export ARCADE ARCADE_LIB ARCADE_TESTKIT_LIB
