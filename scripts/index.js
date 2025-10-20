import { world, system, EasingType } from "@minecraft/server";
import {
  MinecraftCameraPresetsTypes,
  MinecraftEntityTypes,
} from "@minecraft/vanilla-data";

const MCDTagsEnum = {
  CameraDev: "devc",
  Cutscene: "cutscene",
};

const MCDItemTypes = {
  Artifact: "mcd:artifact",
  MeleeWeapon: "mcd:meleeweapon",
  RangedWeapon: "mcd:rangedweapon",
};

world.beforeEvents.playerBreakBlock.subscribe(
  (data) => (data.cancel = !data.player.hasTag(MCDTagsEnum.CameraDev))
);

world.beforeEvents.playerInteractWithBlock.subscribe(
  (data) =>
    (data.cancel =
      !data.player.hasTag(MCDTagsEnum.CameraDev) &&
      data.block.x !== Math.trunc(data.block.x) &&
      data.block.y !== Math.trunc(data.block.y) &&
      data.block.z !== Math.trunc(data.block.z))
);

world.beforeEvents.itemUse.subscribe((data) => {
  data.cancel = !data.itemStack.hasTag(MCDItemTypes.Artifact);
});

world.afterEvents.worldLoad.subscribe(() => {
  system.runInterval(() => {
    const players = world.getAllPlayers().filter((p) => p.isValid);
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const { px, py, pz } = player.location;
      const { vx, vy, vz } = player.getVelocity();
      const { phx, phy, phz } = player.getHeadLocation();
      const nx = px + vx * 2;
      const ny = py + vx * 2;
      const nz = pz + vz * 2;
      const block = player.dimension.getBlock({
        x: nx,
        y: ny,
        z: nz,
      });
      const block2 = player.dimension.getBlock({
        x: phx + vx * 2,
        y: phy * vy * 2,
        z: phz + vz * 2,
      });

      /// Stepping
      if ((block && !block2) || block2 === undefined) {
        player.teleport({
          x: nx,
          y: ny + (block.y - py) + 0.3,
          z: nz,
        });
      }

      /// Camera
      if (!player.hasTag(MCDTagsEnum.CameraDev)) {
        player.camera.setCamera(MinecraftCameraPresetsTypes.Free, {
          easeOptions: {
            easeTime: 1,
            easeType: EasingType.Linear,
          },
          location: {
            x: px + 20,
            y: py + 20,
            z: pz + 20,
          },
          facingLocation: player.getHeadLocation(),
        });

        const entity = player.dimension.getEntities({
          maxDistance: 5,
          excludeTypes: [MinecraftEntityTypes.Player],
        })[0];

        if (!entity) {
          player.runCommand(`aimassist ${player.name} set 90 90 5 distance`);
        } else {
        }

        const movementVector = player.inputInfo.getMovementVector();
        const yaw = Math.atan2(movementVector.z, movementVector.x);
        player.setRotation({ x: 0, y: yaw * (180 / Math.PI) });
      } else {
        player.camera.clear();
      }
    }
  });
});
