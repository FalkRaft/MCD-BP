import { world, system, EasingType } from "@minecraft/server";
import {
  MinecraftCameraPresetsTypes,
  MinecraftEntityTypes,
} from "./@minecraft/vanilla-data.js";
import { MCDItemTypes, MCDTagsEnum } from "./@mcd/data.js";

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
      const px = player.location.x;
      const py = player.location.y;
      const pz = player.location.z;
      const vx = player.getVelocity().x;
      const vy = player.getVelocity().y;
      const vz = player.getVelocity().z;
      const phx = player.getHeadLocation().x;
      const phy = player.getHeadLocation().y;
      const phz = player.getHeadLocation().z;
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
        const yaw = Math.atan2(movementVector.y, movementVector.x);
        const yyaw = yaw * (180 / Math.PI);
        player.setRotation({ x: 0, y: yyaw });
      } else {
        player.camera.clear();
      }
    }
  });
});
