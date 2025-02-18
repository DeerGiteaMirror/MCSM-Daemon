// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";
import SendCommand from "./cmd";

export default class StopCommand extends InstanceCommand {
  constructor() {
    super("StopCommand");
  }

  async exec(instance: Instance) {
    // If the automatic restart function is enabled, the setting is ignored once
    if (instance.config.eventTask && instance.config.eventTask.autoRestart) instance.config.eventTask.ignore = true;

    // send stop command
    if (instance.isRunningOnDemand()) {
      return await instance.stopOnDemand();
    } else {
      return await instance.execPreset("stop");
    }
  }
}
