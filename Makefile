.PHONY: coverage

test:
	./node_modules/jasme/run.js

lint:
	./node_modules/eslint/bin/eslint.js .

coverage:
	./node_modules/istanbul/lib/cli.js cover \
		-i 'src/**/*.js' \
		--dir coverage \
		./node_modules/jasme/run.js

coveralls: coverage
ifndef COVERALLS_REPO_TOKEN
	$(error COVERALLS_REPO_TOKEN is undefined)
endif
	node_modules/coveralls/bin/coveralls.js < coverage/lcov.info
