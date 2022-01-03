#!/bin/bash

rm -rf .openzeppelin

./1preWethRun.sh
./2preWethRun.sh
# ./1preErc20Run.sh
# ./2preErc20Run.sh
./1preErc721Run.sh
./2preErc721Run.sh
