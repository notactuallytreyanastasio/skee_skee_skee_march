# Skee Skee Skee in March. See docs/PORT.md.
export PATH := $(HOME)/.march/bin:$(PATH)

SWIFT_FLAGS := -c release -Xswiftc -enable-testing
GOLDEN_DIR := tools/golden
GOLDEN_TARGETS := rng physics scoring items run

.PHONY: test test-js test-native check check-purity format golden build selftest clean

# Native: every test block, plus the purity guard.
test: check-purity
	forge test
	@pending=$$(grep -l 'Harness.pending' test/mains/*_main.march | xargs -n1 basename | sed 's/_main.march//' | tr '\n' ' '); \
	  [ -z "$$pending" ] || echo "pending, no tests yet: $$pending"

# The same suites on the shipping target, through node.
test-js: check-purity
	scripts/run-all.sh js

# The same suites as native plain-main programs: what test-<suite> runs.
test-native: check-purity
	scripts/run-all.sh native

# One suite, both targets. Only compiles what that suite reaches, so another
# agent's half-written module cannot break it.
test-%:
	scripts/run-suite.sh $* native
	scripts/run-suite.sh $* js

test-js-%:
	scripts/run-suite.sh $* js

test-native-%:
	scripts/run-suite.sh $* native

check-purity:
	python3 scripts/check_core.py

# Types, lint, format and the core rules over lib/, test/ and shell/. Fails on
# any warning.
check:
	scripts/check.sh

# Never run bare `forge format`: it can delete code. See docs/PORT.md.
format:
	scripts/format.sh

golden: $(addprefix golden-,$(GOLDEN_TARGETS))

golden-%:
	cd $(GOLDEN_DIR) && swift build $(SWIFT_FLAGS) --product golden-$*
	$(GOLDEN_DIR)/.build/release/golden-$* $(CURDIR)

# The browser build. opt.fold must stay off: see docs/PORT.md.
build:
	MARCH_DISABLE_PASS=opt.fold forge build --target js

# Proves every guard goes red on a planted violation.
selftest:
	scripts/selftest.sh

clean:
	rm -rf dist .march .forge
