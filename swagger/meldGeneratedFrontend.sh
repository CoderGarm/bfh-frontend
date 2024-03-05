#!/bin/bash

rm -rf swaggerGenerated/

java -jar swagger-codegen-cli-3.0.34.jar generate --additional-properties stringEnums=true ngVersion=16 -i /tmp/open-api3.json -o swaggerGenerated/ -l typescript-angular

echo 'inserting environment'
cd swaggerGenerated/api/ || exit 1
for filename in ./*; do
  lineNo=$(awk "/import { Configuration }/{ print NR+1; exit }" $filename)
  if [[ ! -z "$lineNo" ]]; then
    sed -i "$lineNo i import {environment} from '../../../../environments/environment';" $filename
  fi
done

cd ../..
echo 'editing models'
cd swaggerGenerated/model/ || exit 1
for filename in ./*; do
  if [[ $filename == './userReq.ts' ]]; then
    #echo "replacing boolean primitive by wrapper because a primitive boolean will not be 'rendered' in a http post request for whatever reasons"
    lineNo=$(awk "/noEMailWanted: boolean;/{ print NR; exit }" $filename)
    if [[ ! -z "$lineNo" ]]; then
      cmd=$(echo -n "$lineNo")
      cmd2=$(echo -n "s/boolean/Boolean/")
      sed -i "$cmd$cmd2" $filename
    fi
  fi
  #echo "replacing enum constants with camel case"
  sed -i 's/ALLIANCEADMIN/ALLIANCE_ADMIN/' $filename
  sed -i 's/WIKIADMIN/WIKI_ADMIN/' $filename
  sed -i 's/FORUMREAD/FORUM_READ/' $filename
  sed -i 's/FORUMWRITE/FORUM_WRITE/' $filename
  sed -i 's/PIRATERAID/PIRATE_RAID/' $filename
  sed -i 's/PIRATEHUNT/PIRATE_HUNT/' $filename
  sed -i 's/CONVOYPROTECTION/CONVOY_PROTECTION/' $filename
  sed -i 's/PIRATERAID/PIRATE_RAID/' $filename
  sed -i 's/PIRATEHUNT/PIRATE_HUNT/' $filename
  sed -i 's/CONVOYPROTECTION/CONVOY_PROTECTION/' $filename
  sed -i 's/CONVOYRAID/CONVOY_RAID/' $filename
  sed -i 's/BEGINOFMISSION/BEGIN_OF_MISSION/' $filename
  sed -i 's/ENDOFMISSION/END_OF_MISSION/' $filename
  sed -i 's/LEAVEORBIT/LEAVE_ORBIT/' $filename
  sed -i 's/NOBATTLE/NO_BATTLE/' $filename
  sed -i 's/RAREELEMENTS/RARE_ELEMENTS/' $filename
  sed -i 's/HEAVYMETALS/HEAVY_METALS/' $filename
  sed -i 's/ORBITALCONSTRUCTION/ORBITAL_CONSTRUCTION/' $filename
  sed -i 's/RAREELEMENTS/RARE_ELEMENTS/' $filename
  sed -i 's/HEAVYMETALS/HEAVY_METALS/' $filename
  sed -i 's/ORBITALCONSTRUCTION/ORBITAL_CONSTRUCTION/' $filename
  sed -i 's/ELECTRONICWARFARE/ELECTRONIC_WARFARE/' $filename
  sed -i 's/TRANSPORTATIONDEMAND/TRANSPORTATION_DEMAND/' $filename
  sed -i 's/TRANSPORTATIONDELIVERY/TRANSPORTATION_DELIVERY/' $filename
  sed -i 's/SOLARIANLEAGUE/SOLARIAN_LEAGUE/' $filename
  sed -i 's/WELCOMEMESSAGE/WELCOME_MESSAGE/' $filename
  sed -i 's/MISSIONTYPES/MISSION_TYPES/' $filename
  sed -i 's/GAMEMECHANICS/GAME_MECHANICS/' $filename
  sed -i 's/FLEETDASH/FLEET_DASH/' $filename
  sed -i 's/JOBDASH/JOB_DASH/' $filename
  sed -i 's/TRADEDASH/TRADE_DASH/' $filename
  sed -i 's/INFRADASH/INFRA_DASH/' $filename
  sed -i 's/BATTLEDASH/BATTLE_DASH/' $filename
  sed -i 's/PLANETDASH/PLANET_DASH/' $filename
  sed -i 's/PLANETCONSTRUCTIONS/PLANET_CONSTRUCTIONS/' $filename
  sed -i 's/PLANETSHIPYARD/PLANET_SHIPYARD/' $filename
  sed -i 's/MARKETPLACE/MARKETPLACE/' $filename
  sed -i 's/INNEREMPIRETRANSPORTATION/INNER_EMPIRE_TRANSPORTATION/' $filename
  sed -i 's/UNIVERSEMAP/UNIVERSE_MAP/' $filename
  sed -i 's/STARMAP/STAR_MAP/' $filename
  sed -i 's/MISSION/MISSION/' $filename
  sed -i 's/COLONIZATIONINFO/COLONIZATION_INFO/' $filename
  sed -i 's/FLEETDETACHMENT/FLEET_DETACHMENT/' $filename
  sed -i 's/PASSIVEMODULE/PASSIVE_MODULE/' $filename
  sed -i 's/ORBITALMODULE/ORBITAL_MODULE/' $filename
  sed -i 's/MOVEMENTPHASE/MOVEMENT_PHASE/' $filename
  sed -i 's/ELOKAPHASE/ELOKA_PHASE/' $filename
  sed -i 's/COUNTERMISSILEPHASE/COUNTER_MISSILE_PHASE/' $filename
  sed -i 's/MISSILEMOVEMENTPHASE/MISSILE_MOVEMENT_PHASE/' $filename
  sed -i 's/BEAMFIREINCOMINGPHASE/BEAM_FIRE_INCOMING_PHASE/' $filename
  sed -i 's/MISSILEFIREINCOMINGPHASE/MISSILE_FIRE_INCOMING_PHASE/' $filename
  sed -i 's/BEAMFIREPHASE/BEAM_FIRE_PHASE/' $filename
  sed -i 's/MISSILEFIREPHASE/MISSILE_FIRE_PHASE/' $filename
  sed -i 's/COUNTERMISSILE/COUNTER_MISSILE/' $filename
  sed -i 's/POINTDEFENSE/POINT_DEFENSE/' $filename
  sed -i 's/WARHARVEST23/WAR_HARVEST_23/' $filename
  sed -i 's/TOURNAMENTFORHONOR24/TOURNAMENT_FOR_HONOR_24/' $filename
  sed -i 's/WONFIGHTSV1/WON_FIGHTS_V1/' $filename
  sed -i 's/WONFIGHTSV3/WON_FIGHTS_V3/' $filename
  sed -i 's/WONFIGHTSV5/WON_FIGHTS_V5/' $filename
  sed -i 's/GAINEDPLANETS/GAINED_PLANETS/' $filename
  sed -i 's/GAINEDCONSTRUCTIONLEVELS/GAINED_CONSTRUCTION_LEVELS/' $filename
  sed -i 's/FLEETTONNAGELOST/FLEET_TONNAGE_LOST/' $filename
  sed -i 's/FLEETTONNAGEDESTROYED/FLEET_TONNAGE_DESTROYED/' $filename
done

cd ../..
echo 'using environment'
find . -name '*Api.service.ts' -exec sed -i -E "s|protected basePath = 'http://localhost:8080';|protected basePath = environment.backendServer;|g" {} \;

echo 'removing unnecessary files'
find . -name .gitignore -exec rm {} \;
find . -name .npmignore -exec rm {} \;
find . -name .swagger-codegen-ignore -exec rm {} \;

echo 'removing unnecessary folders'
find . -type d -name '.swagger-codegen' -exec rm -rf {} \; 2>/dev/null

meld swaggerGenerated/ ../src/app/services/swagger/
rm -rf swaggerGenerated/
cp /tmp/open-api3.json .
echo "done and typescript extract deleted in download folder"
