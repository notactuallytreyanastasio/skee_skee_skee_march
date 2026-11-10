# Putt, the arcade engine's second game: top-down mini-golf. See README.md.
#   make check   forge check + lint of lib/, march --check of the suites
#   make test    the suites, native and JS (HARNESS PASS on both)
#   make web     not yet: see README.md, "Not yet: the browser launch"

ARCADE := ../..
include $(ARCADE)/arcade.mk

.PHONY: check test test-native test-js web clean

check:
	scripts/check.sh

test: test-native test-js

test-native:
	scripts/run-suite.sh putt native

test-js:
	scripts/run-suite.sh putt js

# Fails loudly until the engine's web runtime exists: no stand-in launch.
web:
	@echo "putt web: the browser launch waits on Arcade.Web.Runtime (engine steps 12-13); see README.md"
	@exit 1

clean:
	rm -rf .march .forge
