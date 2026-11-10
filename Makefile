# Skee Skee Skee in March. See docs/PORT.md.
# make 3.81 finds a recipe's first word with its own PATH, not an exported one.
FORGE := $(HOME)/.march/bin/forge

# The engine: its lib roots and the JS build flags every game shares.
ARCADE := arcade
include $(ARCADE)/arcade.mk

SWIFT_FLAGS := -c release -Xswiftc -enable-testing
GOLDEN_DIR := tools/golden
GOLDEN_TARGETS := rng physics scoring items rooms run bots presentation

.PHONY: test test-js test-native check check-purity format golden build web serve playtest audio-check selftest clean

# Native: every test block, plus the purity guard and the engine's own suites
# (native and JS).
test: check-purity test-arcade
	$(FORGE) test
	@pending=$$(grep -l 'Arcade.Test.Harness.pending' test/mains/*_main.march | xargs -n1 basename | sed 's/_main.march//' | tr '\n' ' '); \
	  [ -z "$$pending" ] || echo "pending, no tests yet: $$pending"

# The same suites on the shipping target, through node.
test-js: check-purity test-arcade-js
	scripts/run-all.sh js

# The same suites as native plain-main programs: what test-<suite> runs.
test-native: check-purity test-arcade-native
	scripts/run-all.sh native

# One suite on one target. These precede test-% because make 3.81 takes the
# first pattern that matches.
test-js-%:
	scripts/run-suite.sh $* js

test-native-%:
	scripts/run-suite.sh $* native

# One suite, both targets. Only compiles what that suite reaches, so another
# agent's half-written module cannot break it.
test-%:
	scripts/run-suite.sh $* native
	scripts/run-suite.sh $* js

check-purity:
	python3 scripts/check_core.py

# Types, lint, format and the core rules over lib/, test/ and shell/, after the
# engine's own check (arcade.mk). Fails on any warning.
check: check-arcade
	scripts/check.sh

# Never run bare `forge format`: it can delete code. See docs/PORT.md.
format:
	scripts/format.sh

golden: $(addprefix golden-,$(GOLDEN_TARGETS)) golden-host

# The host piece: SkeeCore's Host, HostGuard and Haggle, and SkeeNet's DeepSeek
# against a mock relay, in a package of its own (its .build stays under
# tools/golden_host). golden-unicode writes lib/skee/unicode_data.march, the
# Swift runtime's Unicode tables that Skee.SwiftText reads, put through the
# formatter so `make check` stays clean; golden-host writes test/golden/host.march.
golden-host:
	cd tools/golden_host && swift build $(SWIFT_FLAGS) --scratch-path $(CURDIR)/tools/golden_host/.build
	tools/golden_host/.build/release/golden-unicode $(CURDIR)
	$(FORGE) format --stdin < lib/skee/unicode_data.march > lib/skee/unicode_data.march.tmp
	mv lib/skee/unicode_data.march.tmp lib/skee/unicode_data.march
	tools/golden_host/.build/release/golden-host $(CURDIR)

# The synth is in SkeeRender, so its generator is a package of its own (synth piece).
golden-synth:
	cd tools/golden_synth && swift build $(SWIFT_FLAGS) --product golden-synth --scratch-path $(CURDIR)/tools/golden_synth/.build
	tools/golden_synth/.build/release/golden-synth $(CURDIR)

# The scene goldens need SkeeScene (SceneKit), so they have a package of their
# own; its .build stays under tools/golden_scene.
golden-scene:
	cd tools/golden_scene && swift build -c release --product golden-scene --scratch-path $(CURDIR)/tools/golden_scene/.build
	tools/golden_scene/.build/release/golden-scene $(CURDIR)

golden-%:
	cd $(GOLDEN_DIR) && swift build $(SWIFT_FLAGS) --product golden-$*
	$(GOLDEN_DIR)/.build/release/golden-$* $(CURDIR)

# The browser build. opt.fold must stay off (ARCADE_JS_FLAGS): see
# docs/PORT.md. forge puts only lib/ and the deps on the module path, and the
# shell's modules are in shell/, so these call march directly with the engine,
# lib and shell.
MARCH := $(HOME)/.march/bin/march
SHELL_LIB := $(ARCADE_LIB):lib:shell
WEB_FILES := web/index.html web/style.css web/skee_glue.mjs web/skee_audio.mjs web/skee_synth_cell.mjs web/skee_worklet.mjs
# The audio worklet's own build: Skee.Synth alone, loaded by AudioWorklet.addModule.
WORKLET := shell/synth_worklet.march
PORT ?= 8137

build:
	mkdir -p .march/build/debug
	MARCH_LIB_PATH=$(SHELL_LIB) $(MARCH) $(ARCADE_JS_FLAGS) -o .march/build/debug/skee.mjs shell/game.march
	MARCH_LIB_PATH=$(SHELL_LIB) $(MARCH) $(ARCADE_JS_FLAGS) -o .march/build/debug/skee_synth_worklet.mjs $(WORKLET)
	cp web/skee_glue.mjs web/skee_audio.mjs web/skee_synth_cell.mjs web/skee_worklet.mjs .march/build/debug/

# The game as a static site in dist/: skee.mjs, March's runtime modules, the
# glue, index.html and style.css.
web:
	mkdir -p dist
	MARCH_LIB_PATH=$(SHELL_LIB) $(MARCH) $(ARCADE_JS_FLAGS) -o dist/skee.mjs shell/game.march
	MARCH_LIB_PATH=$(SHELL_LIB) $(MARCH) $(ARCADE_JS_FLAGS) -o dist/skee_synth_worklet.mjs $(WORKLET)
	cp $(WEB_FILES) dist/
	@echo "web: dist/index.html"

# Serve dist/ at http://127.0.0.1:$(PORT)/ (PORT=... to change). Node, not
# python3 -m http.server, whose loopback connections time out on this machine.
serve: web
	node tools/serve/serve.mjs dist $(PORT)

# Headless Chrome against a running `make serve`: screenshots in
# tools/playtest/shots/. Needs `npm install` in tools/playtest once.
playtest:
	node tools/playtest/playtest.mjs http://127.0.0.1:$(PORT)/

# The audio: the shipped worklet under node and in headless Chrome against the
# Swift Synth's golden samples, then the game's AudioContext, both paths, and
# one throw's cue timeline. Serves dist/ itself on port 8139.
audio-check: web
	node tools/audio_check/worklet_node.mjs
	node tools/audio_check/audio_playtest.mjs

# Proves every guard goes red on a planted violation.
selftest:
	scripts/selftest.sh

clean:
	rm -rf dist .march .forge
