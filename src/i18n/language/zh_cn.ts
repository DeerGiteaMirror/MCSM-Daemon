export default {
  // -----------------------
  // src\
  // -----------------------

  // src\app.ts
  app: {
    welcome: "欢迎使用 MCSManager 守护进程",
    instanceLoad: "所有应用实例已加载，总计 {{n}} 个",
    instanceLoadError: "读取本地实例文件失败:",
    sessionConnect: "会话 {{ip}} {{uuid}} 已连接",
    sessionDisconnect: "会话 {{ip}} {{uuid}} 已断开",
    started: "守护进程现已成功启动",
    doc: "参考文档：https://docs.mcsmanager.com/",
    addr: "访问地址：http://<IP地址>:{{port}}/ 或 ws://<IP地址>:{{port}}",
    configPathTip: "配置文件：data/Config/global.json",
    password: "访问密钥：{{key}}",
    passwordTip: "密钥作为唯一认证方式，请使用 MCSManager 面板的节点功能连接程序",
    exitTip: "你可以使用 Ctrl+C 快捷键即可关闭程序"
  },

  // -----------------------
  // src\common\
  // -----------------------

  common: {
    title: "标题",
    _7zip: "[7zip 压缩任务]",
    _7unzip: "[7zip 解压任务]",
    killProcess: "进程 {{pid}} 已使用系统指令强制终止进程",
    uuidIrregular: "UUID {{uuid}} 不符合规范"
  },

  // -----------------------
  // src\entity\commands\
  // -----------------------

  // src\entity\commands\base\command_parser.ts
  command: {
    quotes: "错误的命令双引号，无法找到成对双引号，如需使用单个双引号请使用 {quotes} 符号",
    errLen: "错误的命令长度，请确保命令格式正确",
    instanceNotOpen: "命令执行失败，因为实例实际进程不存在"
  },
  // src\entity\commands\docker\docker_start.ts
  instance: {
    dirEmpty: "启动命令，输入输出编码或工作目录为空值",
    dirNoE: "工作目录并不存在",
    invalidCpu: "非法的CPU核心指定 {{v}}",
    invalidContainerName: "非法的容器名 {{v}}",
    successful: "实例 {{v}} 启动成功"
  },
  // src\entity\commands\start.ts
  start: {
    instanceNotDown: "实例未处于关闭状态，无法再进行启动",
    instanceMaturity: "实例使用到期时间已到，无法再启动实例",
    startInstance: "正在准备启动实例..."
  },
  // src\entity\commands\general\general_restart.ts
  restart: {
    start: "重启实例计划开始执行",
    error1: "重启实例状态错误，实例已被启动过，上次状态的重启计划取消",
    error2: "重启实例状态错误，实例状态应该为停止中状态，现在变为正在运行，重启计划取消",
    restarting: "检测到服务器已停止，正在重启实例..."
  },
  // src\entity\commands\general\general_start.ts
  general_start: {
    instanceConfigErr: "启动命令，输入输出编码或工作目录为空值",
    cwdPathNotExist: "工作目录并不存在",
    cmdEmpty: "无法启动实例，启动命令为空",
    startInstance: "会话 {{source}}: 请求开启实例.",
    instanceUuid: "实例标识符: [{{uuid}}]",
    startCmd: "启动命令: {{cmdList}}",
    cwd: "工作目录: {{cwd}}",
    pidErr: `检测到实例进程/容器启动失败（PID 为空），其可能的原因是：
    1. 实例启动命令编写错误，请前往实例设置界面检查启动命令与参数。
    2. 系统主机环境不正确或缺少环境，如 Java 环境等。
    
    原生启动命令：
    {{startCommand}}
    
    启动命令解析体:
    程序：{{commandExeFile}}
    参数：{{commandParameters}}
    
    请将此信息报告给管理员，技术人员或自行排查故障。`,
    startErr: "实例启动失败，请检查启动命令，主机环境和配置文件等",
    startSuccess: "实例 {{instanceUuid}} 成功启动 PID: {{pid}}",
    startOrdinaryTerminal:
      "应用实例已运行，您可以在底部的命令输入框发送命令，如果您需要支持 Ctrl，Tab 等快捷键等高级控制台功能，请前往终端设置开启仿真终端功能"
  },
  // src\entity\commands\general\general_stop.ts
  general_stop: {
    notRunning: "实例未处于运行中状态，无法进行停止.",
    execCmd: "已执行预设的关闭命令：{{stopCommand}}\n如果无法关闭实例请前往实例设置更改关闭实例的正确命令，比如 ^C，stop，end 等",
    stopErr:
      "关闭命令已发出但长时间未能关闭实例，可能是实例关闭命令错误或实例进程假死导致，现在将恢复到运行中状态，可使用强制终止指令结束进程。"
  },
  // src\entity\commands\general\general_update.ts
  general_update: {
    statusErr_notStop: "实例状态不正确，无法执行更新任务，必须停止实例",
    statusErr_otherProgress: "实例状态不正确，有其他任务正在运行中",
    readyUpdate: "实例 {{instanceUuid}} 正在准备进行更新操作...",
    updateCmd: "实例 {{instanceUuid}} 执行更新命令如下:",
    cmdFormatErr: "更新命令格式错误，请联系管理员",
    err: "Error",
    updateFailed: "更新失败，更新命令启动失败，请联系管理员",
    update: "更新",
    updateSuccess: "更新成功！",
    updateErr: "更新程序结束，但结果不正确，可能文件更新损坏或网络不畅通",
    error: "更新错误: {{err}}",
    terminateUpdate: "用户请求终止实例 {{instanceUuid}} 的 update 异步任务",
    killProcess: "正在强制杀死任务进程..."
  },
  // src\entity\commands\pty\pty_start.ts
  pty_start: {
    cmdErr: "启动命令，输入输出编码或工作目录为空值",
    cwdNotExist: "工作目录并不存在",
    startPty: "会话 {{source}}: 请求开启实例，模式为仿真终端",
    startErr: "仿真终端模式失败，可能是依赖程序不存在，已自动降级到普通终端模式...",
    notSupportPty: "仿真终端模式失败，无法支持的架构或系统，已自动降级到普通终端模式...",
    cmdEmpty: "无法启动实例，启动命令为空",
    sourceRequest: "会话 {{source}}: 请求开启实例.",
    instanceUuid: "实例标识符: [{{instanceUuid}}]",
    startCmd: "启动命令: {{cmd}}",
    ptyPath: "PTY 路径: {{path}}",
    ptyParams: "PTY 参数: {{param}}",
    ptyCwd: "工作目录: {{cwd}}",
    pidErr: `检测到实例进程/容器启动失败（PID 为空），其可能的原因是：
    1. 实例启动命令编写错误，请前往实例设置界面检查启动命令与参数。
    2. 系统主机环境不正确或缺少环境，如 Java 环境等。
    
    原生启动命令：
    {{startCommand}}
    
    仿真终端中转命令:
    程序：{{path}}
    参数：{{params}}
    
    请将此信息报告给管理员，技术人员或自行排查故障。
    如果您认为是面板仿真终端导致的问题，请在左侧终端设置中关闭“仿真终端”选项，我们将会采用原始输入输出流的方式监听程序。`,
    instanceStartErr: "实例启动失败，请检查启动命令，主机环境和配置文件等",
    startSuccess: "实例 {{instanceUuid}} 成功启动 PID: {{pid}}.",
    startEmulatedTerminal: "全仿真终端模式已生效，您可以直接在终端内直接输入内容并使用 Ctrl，Tab 等功能键。"
  },
  // src\entity\commands\pty\pty_stop.ts
  pty_stop: {
    ctrlC: "仿真终端无法使用Ctrl+C命令关闭进程，请重新设置关服命令",
    notRunning: "实例未处于运行中状态，无法进行停止.",
    execCmd: "已执行预设的关闭命令：{{stopCommand}}\n如果无法关闭实例请前往实例设置更改关闭实例的正确命令，比如 exit，stop，end 等",
    stopErr:
      "关闭命令已发出但长时间未能关闭实例，可能是实例关闭命令错误或实例进程假死导致，现在将恢复到运行中状态，可使用强制终止指令结束进程。"
  },

  // -----------------------
  // src\entity\instance\
  // -----------------------

  // src\entity\instance\instance.ts
  instanceConf: {
    initInstanceErr: "初始化实例失败，唯一标识符或配置参数为空",
    cantModifyInstanceType: "正在运行时无法修改此实例类型",
    cantModifyProcessType: "正在运行时无法修改此实例进程类型",
    cantModifyPtyModel: "正在运行时无法修改PTY模式",
    ptyNotExist: "无法启用仿真终端，因为 {{path}} 附属程序不存在，您可以联系管理员重启 Daemon 程序得以重新安装（仅 Linux）",
    instanceLock: "此 {{info}} 操作无法执行，因为实例处于锁定状态，请稍后再试.",
    instanceBusy: "当前实例正处于忙碌状态，无法执行任何操作.",
    info: "信息",
    error: "错误",
    autoRestart: "检测到实例关闭，根据主动事件机制，自动重启指令已发出...",
    autoRestartErr: "自动重启错误: {{err}}",
    instantExit: "检测到实例启动后在极短的时间内退出，原因可能是您的启动命令错误或配置文件错误。"
  },
  // src\entity\instance\preset.ts
  preset: {
    actionErr: "预设命令 {{action}} 不可用"
  },
  // src\entity\instance\process_config.ts
  process_config: {
    writEmpty: "写入内容为空，可能是配置文件类型不支持"
  },

  // -----------------------
  // src\entity\minecraft\
  // -----------------------

  // src\entity\minecraft\mc_update.ts
  mc_update: {
    updateInstance: "更新实例....."
  },

  // -----------------------
  // src\routers\
  // -----------------------

  // src\routers\auth_router.ts
  auth_router: {
    notAccess: "会话 {{id}}({{address}}) 试图无权限访问 {{event}} 现已阻止.",
    illegalAccess: "权限不足，非法访问",
    access: "会话 {{id}}({{address}}) 验证身份成功",
    disconnect: "会话 {{id}}({{address}}) 因长时间未验证身份而断开连接"
  },
  // src\routers\environment_router.ts
  environment_router: {
    dockerInfoErr: "无法获取镜像信息，请确保您已正确安装Docker环境",
    crateImage: "守护进程正在创建镜像 {{name}}:{{tag}} DockerFile 如下:\n{{dockerFileText}}\n",
    crateSuccess: "创建镜像 {{name}}:{{tag}} 完毕",
    crateErr: "创建镜像 {{name}}:{{tag}} 错误:{{error}}",
    delImage: "守护进程正在删除镜像 {{imageId}}"
  },
  // src\routers\file_router.ts
  file_router: {
    instanceNotExist: "实例 {{instanceUuid}} 不存在",
    unzipLimit: "超出最大同时解压缩任务量，最大准许{{maxFileTask}}个，目前有{{fileLock}}个任务正在进行，请耐心等待"
  },
  // src\routers\http_router.ts
  http_router: {
    instanceNotExist: "实例不存在",
    fileNameNotSpec: "用户文件下载名不符合规范",
    downloadErr: "下载出错: {{error}}",
    updateErr: "未知原因: 上传失败"
  },
  // src\routers\Instance_router.ts
  Instance_router: {
    requestIO: "会话 {{id}} 请求转发实例 {{targetInstanceUuid}} IO 流",
    cancelIO: "会话 {{id}} 请求取消转发实例 {{targetInstanceUuid}} IO 流",
    openInstanceErr: "实例{{instanceUuid}}启动时错误: ",
    performTasks: "会话 {{id}} 要求实例 {{uuid}} 执行异步 {{taskName}} 异步任务",
    performTasksErr: "实例 {{uuid}} {{taskName}} 异步任务执行异常: {{err}}",
    taskEmpty: "无异步任务正在运行",
    accessFileErr: "文件不存在或路径错误，文件访问被拒绝",
    terminalLogNotExist: "终端日志文件不存在"
  },
  // src\routers\passport_router.ts
  passport_router: {
    registerErr: "不可定义任务名或密钥为空"
  },
  // src\routers\stream_router.ts
  stream_router: {
    unauthorizedAccess: "权限不足，非法访问",
    taskNotExist: "任务不存在",
    instanceNotExist: "实例不存在",
    authSuccess: "会话 {{id}} {{address}} 数据流通道身份验证成功",
    establishConnection: "会话 {{id}} {{address}} 已与 {{uuid}} 建立数据通道",
    disconnect: "会话 {{id}} {{address}} 已与 {{instanceUuid}} 断开数据通道"
  },

  // -----------------------
  // src\service\
  // -----------------------

  // src\service\file_router_service.ts
  file_router_service: {
    instanceNotExit: "实例 {{uuid}} 不存在"
  },
  // src\service\install.ts
  install: {
    ptyNotSupportSystem: "仿真终端只能支持 Windows/Linux x86_64 架构，已自动降级为普通终端",
    ptySupport: "识别到可选依赖库安装，仿真终端功能已可用",
    skipInstall: "检测到系统不是 Linux 系统，自动跳过依赖库安装",
    installed: "可选依赖程序已自动安装，仿真终端和部分高级功能已自动启用",
    guide: "依赖程序参考：https://github.com/mcsmanager/pty",
    changeModeErr: "修改文件 {{path}} 权限失败，请手动设置其为 chmod 755 以上",
    installErr: "安装可选依赖库失败，全仿真终端和部分可选功能将无法使用，不影响正常功能，将在下次启动时再尝试安装"
  },
  // src\service\protocol.ts
  protocol: {
    socketErr: "会话 {{id}}({{address}})/{{event}} 响应数据时异常:\n"
  },
  // src\service\router.ts
  router: {
    initComplete: "所有功能模块与权限防火墙已初始化完毕"
  },
  // src\service\system_file.ts
  system_file: {
    illegalAccess: "非法访问路径",
    unzipLimit: "文件解压缩只支持最大 {{max}}GB 文件的解压缩，如需改变上限请前往 data/Config/global.json 文件",
    execLimit: "超出最大文件编辑限制"
  },
  // src\service\system_instance_control.ts
  system_instance_control: {
    execLimit: "无法继续创建计划任务，以达到上限",
    existRepeatTask: "已存在重复的任务",
    illegalName: "非法的计划名，仅支持下划线，数字，字母和部分本地语言",
    crateTask: "创建计划任务 {{name}}:\n{{task}}",
    crateTaskErr: "计划任务创建错误，不正确的时间表达式: \n{{name}}: {{timeArray}}\n请尝试删除 data/TaskConfig/{{name}}.json 文件解决此问题",
    crateSuccess: "创建计划任务 {{name}} 完毕",
    execCmdErr: "实例 {{uuid}} 计划任务 {{name}} 执行错误: \n {{error}}"
  },
  // src\service\system_instance.ts
  system_instance: {
    autoStart: "实例 {{name}} {{uuid}} 自动启动指令已发出",
    autoStartErr: "实例 {{name}} {{uuid}} 自动启动时错误: {{reason}}",
    readInstanceFailed: "读取 {{uuid}} 应用实例失败: {{error}}",
    checkConf: "请检查或删除文件：data/InstanceConfig/{{uuid}}.json",
    uuidEmpty: "无法新增某实例，因为实例UUID为空"
  },
  // src\service\ui.ts
  ui: {
    help: '[终端] 守护进程拥有基本的交互功能，请输入"help"查看更多信息'
  },
  // src\service\version.ts
  version: {
    versionDetectErr: "版本检查失败"
  }
};
// import { $t } from "../../i18n";
// $t("permission.forbiddenInstance");]
// $t("router.login.ban")
