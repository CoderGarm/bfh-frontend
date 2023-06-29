# Battle for Honor

### An honor harrington browser game

Just a simple 4X game which is based on the honorverse created by David Weber.

### System distribution

This is the frontend of the game.

The backend is located in https://github.com/CoderGarm/spacebattle.

### Deployment

1. rebase branch to origin/master and merge branch into master, commit, push
2. run scripts
   1. [build.sh](build.sh) for staging or production
   2. [copyToMedusa.sh](copyToMedusa.sh)
3. jump on medusa - all scripts are placed in home dir
   1. run [deployFrontend.sh](scripts/deployFrontend.sh)
4. tag commit in git by pattern Release-x.x.x(-fix-xYz)
5. delete feature branch locally and remote
