// @ts-check
import { module } from "@prisma/composer";
import neighborhoodEnergyWebAppService from "./service.mjs";

export default module("falcon", ({ provision }) => {
  provision(neighborhoodEnergyWebAppService, { id: "neighborhoodenergywebapp" });
});
