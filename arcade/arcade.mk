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

# The physics package (Arcade.Physics.*), a lib of its own on top of the core.
ARCADE_PHYSICS_LIB := $(ARCADE)/physics/lib

# Every JS build turns opt.fold off: the folder bakes a computed Float into a
# literal, which the JS emitter truncates to 12 significant digits. The test
# runners (scripts/run-suite.sh) add --js-int-check themselves, so every Int
# a suite computes is checked to stay JS-safe.
ARCADE_JS_FLAGS := --target js --disable-pass opt.fold

export ARCADE ARCADE_LIB ARCADE_TESTKIT_LIB
export ARCADE_PHYSICS_LIB

# The engine's own gate, for the including game's `check` and `test` to depend
# on: check-arcade is forge check and lint of the engine and its test kit plus
# march --check of the engine's suites; test-arcade runs those suites (rows
# copied once into arcade/test/golden, no game code on the path) as native and
# JS plain-main programs. Defining targets here must not change the including
# Makefile's default goal, so it is saved and restored around them.
arcade_saved_goal := $(.DEFAULT_GOAL)

.PHONY: check-arcade test-arcade test-arcade-native test-arcade-js

check-arcade:
	$(ARCADE)/scripts/check.sh

test-arcade: test-arcade-native test-arcade-js

test-arcade-native:
	$(ARCADE)/scripts/run-all.sh native

test-arcade-js:
	$(ARCADE)/scripts/run-all.sh js

.DEFAULT_GOAL := $(arcade_saved_goal)
