compile:
	@echo " > \033[32mCompiling contracts... \033[0m "
	npx hardhat compile

bindings: compile
	@echo " > \033[32mCreating go bindings for ethereum contracts... \033[0m "
	./scripts/bindings/create_bindings.sh
