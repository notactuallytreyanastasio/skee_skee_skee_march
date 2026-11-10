# Putt, the arcade engine's second game: top-down mini-golf. See README.md.
#   make check   forge check + lint of lib/, march --check of the suites
#   make test    the suites, native and JS (HARNESS PASS on both)
#   make web     the browser build: a static site in dist/
#   make serve   serve dist/ at http://127.0.0.1:$(PORT)/
#   make playtest  one flick in headless Chrome against dist/ on $(PORT)

ARCADE := ../..
include $(ARCADE)/arcade.mk

.PHONY: check test test-native test-js web serve playtest clean

check:
	scripts/check.sh

test: test-native test-js

test-native:
	scripts/run-suite.sh putt native

test-js:
	scripts/run-suite.sh putt js

# The browser build. march is called directly, as forge puts only lib/ and
# the deps on the module path and the shell's modules are in shell/. The
# engine's glue (arcade_*.mjs) is copied beside each build by march.
MARCH := $(HOME)/.march/bin/march
WEB_LIB := lib:$(ARCADE_LIB):$(ARCADE_PHYSICS_LIB):shell
PORT ?= 8237
# Where puppeteer-core is installed (its node_modules' parent); the default is
# the host repository's playtest tools. Override with PLAYTEST_MODULES=...
PLAYTEST_MODULES ?= $(ARCADE)/../tools/playtest

# dist/: putt.mjs (shell/putt_shell.march), the audio worklet's own build
# putt_synth_worklet.mjs (shell/putt_worklet.march), March's runtime
# modules, the engine's glue, index.html and style.css.
web:
	mkdir -p dist
	MARCH_LIB_PATH=$(WEB_LIB) $(MARCH) $(ARCADE_JS_FLAGS) -o dist/putt.mjs shell/putt_shell.march
	MARCH_LIB_PATH=$(WEB_LIB) $(MARCH) $(ARCADE_JS_FLAGS) -o dist/putt_synth_worklet.mjs shell/putt_worklet.march
	cp web/index.html web/style.css dist/
	@echo "web: dist/index.html"

serve: web
	node scripts/serve.mjs dist $(PORT)

playtest: web
	node test/web/playtest.mjs dist $(PORT) $(PLAYTEST_MODULES)

clean:
	rm -rf .march .forge dist
