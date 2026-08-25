const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const publicDir = path.join(__dirname, 'public');

function readCSV(filename) {
    const filePath = path.join(publicDir, filename);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const results = Papa.parse(content, { header: true, skipEmptyLines: true });
    return results.data.filter(r => r['front']);
}

function writeCSV(filename, data) {
    const csv = Papa.unparse(data, { quotes: true });
    fs.writeFileSync(path.join(publicDir, filename), csv, 'utf-8');
}

let singleQs = readCSV('单选题.csv');
let multiQs = readCSV('多选题.csv');
let trueFalseQs = readCSV('判断题.csv');

const batch4 = [
  // -------- 单选题 --------
  { front: "[单选题] 46、OBProxy（OceanBase 代理服务器）默认监听客户端连接的端口是？\nA. 2881\nB. 2882\nC. 2883\nD. 2884", back: "答案：C。\n解析：OBProxy 默认监听 2883 端口处理客户端的 SQL 请求；而 OBServer 的 SQL 监听端口默认是 2881，RPC 端口是 2882。", type: "单选题" },
  { front: "[单选题] 47、在 OceanBase 数据库中，用于内部节点间通信的 RPC 端口默认是？\nA. 2881\nB. 2882\nC. 2883\nD. 2884", back: "答案：B。\n解析：OBServer 节点之间通过 RPC 协议进行内部通信（如 Paxos 日志同步、分布式执行调度等），默认端口为 2882。", type: "单选题" },
  { front: "[单选题] 48、关于 OceanBase 的备份恢复机制，物理备份主要备份的是什么？\nA. 仅有数据文件 (SSTable)\nB. 仅有日志文件 (Clog)\nC. 数据文件 (SSTable) + 增量事务日志 (Clog)\nD. 逻辑 SQL 脚本", back: "答案：C。\n解析：物理备份包括基线数据（Data Backup，即 SSTable）和日志归档（Log Archive，即 Clog 日志）。结合这两者可以实现任意时间点恢复 (PITR)。", type: "单选题" },
  { front: "[单选题] 49、当执行一条全表扫描的 SQL 时，OceanBase 的 SQL 引擎如何处理？\nA. 只能在单个节点串行执行\nB. 会把所有数据拉取到 OBProxy 执行\nC. 可以生成分布式并行执行计划 (PX)，利用多节点并行扫描计算\nD. 会被系统拒绝执行", back: "答案：C。\n解析：OceanBase 拥有强大的分布式执行引擎（Parallel Execution, PX），可以将全表扫描任务划分为多个 Task，分发到各个数据所在节点并行执行，最后聚合结果。", type: "单选题" },
  { front: "[单选题] 50、ODC（OceanBase 开发者中心）主要用于什么场景？\nA. 集群的全生命周期管理与安装部署\nB. 数据库对象的开发、SQL 编辑执行、PL/SQL 调试与数据导入导出\nC. 异构数据库的数据迁移与实时同步\nD. 物理服务器资源的监控", back: "答案：B。\n解析：ODC 是开发者工具，主要面向开发人员和 DBA 进行日常的 SQL 编写、调试和数据对象管理。集群管理是 OCP 的功能，迁移同步是 OMS 的功能。", type: "单选题" },
  { front: "[单选题] 51、OceanBase 的 BlockCache（数据块缓存）主要用来缓存什么？\nA. 经常访问的 SQL 执行计划\nB. 数据表中的微块 (Micro Block) 数据，加速读操作\nC. 分布式事务的状态信息\nD. Paxos 的选举信息", back: "答案：B。\n解析：KVCache 中的 BlockCache 用于缓存在磁盘 SSTable 中被频繁读取的数据块，减少物理 I/O，极大提高点查和范围查询的性能。", type: "单选题" },
  { front: "[单选题] 52、关于 OceanBase 中 Zone 的描述，错误的是：\nA. Zone 是一个逻辑概念，通常映射为一个物理机房\nB. 同一个 Zone 内可以包含多台 OBServer\nC. 租户的数据副本通常会在不同的 Zone 之间分布以实现容灾\nD. 一个 Zone 宕机，整个集群的数据就会彻底丢失不可恢复", back: "答案：D。\n解析：只要剩余的 Zone 能够构成 Paxos 的多数派（例如 3 个 Zone 宕了 1 个，还剩 2 个），集群依然可用且数据不会丢失 (RPO=0)。", type: "单选题" },
  { front: "[单选题] 53、在 OceanBase 的 Oracle 模式下，哪种对象可以封装和组织多个相关的存储过程和函数？\nA. Package (包)\nB. Trigger (触发器)\nC. Sequence (序列)\nD. Synonym (同义词)", back: "答案：A。\n解析：OceanBase 的 Oracle 兼容模式支持 Package（包），可以将逻辑相关的存储过程、函数、变量等进行封装和集中管理，高度兼容 Oracle 语法。", type: "单选题" },
  { front: "[单选题] 54、关于 OceanBase 中租户的内存隔离，说法错误的是？\nA. 租户内存是物理独占的，互不干扰\nB. 当某个租户内存不足时，可以借用其他空闲租户的内存\nC. 租户的内存上限由 Unit 的配置决定\nD. 租户内存不足会导致该租户内的事务因内存溢出报错", back: "答案：B。\n解析：OceanBase 租户的内存分配是严格的物理预留和隔离的，不可超卖，也不支持在运行时动态去“借用”其他租户的内存，这样保证了极高的稳定性和隔离性。", type: "单选题" },
  { front: "[单选题] 55、如果要在 OceanBase 集群中新建一个业务，第一步通常是做什么？\nA. 创建表组 (Tablegroup)\nB. 创建资源单元模板 (Resource Unit)\nC. 直接执行 Create Database\nD. 直接执行 Create User", back: "答案：B。\n解析：在 OceanBase 的多租户架构下，新建业务的流程通常是：创建 Unit 模板 -> 创建 Resource Pool (资源池) -> 创建 Tenant (租户) -> 在租户内创建 Database/Schema。", type: "单选题" },
  
  // -------- 多选题 --------
  { front: "[多选题] 43、关于 OCP (OceanBase Control Platform) 的告警管理功能，支持的告警通知渠道包括哪些？\nA. 钉钉 (DingTalk)\nB. 邮件 (Email)\nC. 短信 (SMS)\nD. 自定义 HTTP API 回调", back: "答案：A、B、C、D。\n解析：OCP 提供了强大的告警引擎，支持通过钉钉、邮件、短信以及 Webhook (HTTP API) 方式进行告警触达，方便与企业内部监控系统对接。", type: "多选题" },
  { front: "[多选题] 44、OceanBase 中的系统租户 (sys) 可以执行哪些特殊操作？\nA. 创建普通业务租户\nB. 查看全集群的物理节点运行状态\nC. 随意读取和修改普通租户的业务数据 (如直接 select 业务表)\nD. 修改集群级别的系统参数", back: "答案：A、B、D。\n解析：sys 租户是集群的管理员租户，负责管理资源和查看集群视图，但为了保证数据安全隔离，sys 租户不能跨租户直接读取或修改普通业务租户的数据。", type: "多选题" },
  { front: "[多选题] 45、在数据库进行性能调优时，OceanBase 提供的内部视图中，哪些可以用来分析 SQL 的执行耗时？\nA. GV$OB_SQL_AUDIT\nB. GV$SQL_PLAN_MONITOR\nC. GV$ACTIVE_SESSION_HISTORY\nD. __all_zone", back: "答案：A、B、C。\n解析：SQL Audit 用于记录每一条执行过的 SQL 审计信息；Plan Monitor 用于查看 SQL 并行执行和算子级耗时；ASH 记录活动会话历史，是排查耗时的重要工具。__all_zone 是集群拓扑表，与 SQL 耗时无关。", type: "多选题" },
  { front: "[多选题] 46、在进行数据迁移时，OMS 支持以下哪几种同步方式？\nA. 结构迁移 (Schema 迁移)\nB. 存量数据全量迁移\nC. 增量数据实时同步\nD. 数据一致性比对校验", back: "答案：A、B、C、D。\n解析：OMS 是一站式的迁移工具，涵盖了从结构转换、全量复制、实时增量同步以及割接前的双向数据校验等完整链路。", type: "多选题" },
  { front: "[多选题] 47、以下哪些操作会触发 OceanBase 内存数据的落盘（转储 Minor Freeze）？\nA. 租户内存的 MemTable 达到了转储高水位线\nB. 数据库定期系统定时触发\nC. DBA 手动执行 ALTER SYSTEM MINOR FREEZE 命令\nD. 执行 SELECT 查询语句", back: "答案：A、B、C。\n解析：转储可以由内存达到阈值自动触发，也可以定时触发或手动执行。纯读请求的 SELECT 不会导致数据落盘。", type: "多选题" },
  { front: "[多选题] 48、在部署 OceanBase 集群时，对服务器硬件和系统环境有哪些基本要求？\nA. 所有节点必须配置好 NTP 保证时钟同步\nB. 推荐关闭操作系统的 Swap 交换分区\nC. 推荐配置较高的文件句柄数 (ulimit -n)\nD. 必须使用 Windows Server 操作系统", back: "答案：A、B、C。\n解析：OceanBase 强依赖时钟同步（误差须控制在 100ms 内）；关闭 Swap 可防止内存被换出导致性能抖动；需调大文件句柄数以支持高并发。系统必须是 Linux，不支持 Windows。", type: "多选题" },

  // -------- 判断题 --------
  { front: "[判断题] 58、在 OceanBase 数据库中，只要事务提交成功，对应的 Redo Log 就一定已经通过 Paxos 协议同步到了多数派节点。这也意味着不会丢失任何已提交的数据。", back: "答案：正确。\n解析：这是 OceanBase 保证 RPO=0 的核心逻辑，事务提交强依赖 Paxos 多数派落盘确认，确保断电或单点故障时不丢数据。", type: "判断题" },
  { front: "[判断题] 59、OBProxy 提供了强一致性的路由功能，当应用执行强一致性查询时，OBProxy 一定会将请求路由给该数据的 Leader 副本处理。", back: "答案：正确。\n解析：OceanBase 的默认读写都是强一致性的。OBProxy 会根据内部维护的路由表，精准将请求转发到对应日志流/分区的 Leader 节点，保证读到最新数据。", type: "判断题" },
  { front: "[判断题] 60、对于历史数据的删除（DELETE），OceanBase 的存储引擎会立刻将磁盘上对应的数据块抹除，以立刻释放磁盘空间。", back: "答案：错误。\n解析：OceanBase 采用 LSM-Tree 架构，DELETE 也是一种“追加写入”（插入一个墓碑标记 Tombstone）。实际的空间释放在后台进行 Major Freeze（大合并）时才会发生。", type: "判断题" },
  { front: "[判断题] 61、OceanBase 支持在一套集群内使用不同配置（如 CPU、内存大小不同）的服务器，这种部署方式通常被称为异构部署。", back: "答案：正确。\n解析：OceanBase 支持异构机型混合部署，只要将配置不同的机器划分为不同的 Zone 或者通过不同的 Resource Unit 精细调度即可。", type: "判断题" },
  { front: "[判断题] 62、如果用户不小心删除了表中的核心数据，可以通过 OceanBase 提供的 Flashback（闪回）功能，将表数据快速恢复到过去某个时间点的状态。", back: "答案：正确。\n解析：OceanBase 高度兼容 Oracle 的诸多企业级功能，包括基于 Undo 和历史版本的回收站（Recyclebin）和闪回查询（Flashback Query）能力。", type: "判断题" }
];

batch4.forEach(item => {
    if (item.type === '单选题') singleQs.push(item);
    if (item.type === '多选题') multiQs.push(item);
    if (item.type === '判断题') trueFalseQs.push(item);
});

writeCSV('单选题.csv', singleQs);
writeCSV('多选题.csv', multiQs);
writeCSV('判断题.csv', trueFalseQs);

console.log('Batch 4 appended successfully. Total questions added: ' + batch4.length);
