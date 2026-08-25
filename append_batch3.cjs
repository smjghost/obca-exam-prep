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

const batch3 = [
  // -------- 单选题 --------
  { front: "[单选题] 16、关于OceanBase的架构特点，以下哪个是错误的？\nA.无共享\nB.全局等价节点\nC.准内存数据库\nD.集中式管控", back: "答案：D。\n解析：OceanBase 是对等节点无共享（Shared-Nothing）分布式架构，没有传统的集中式存储或管控单点瓶颈。RootService 只是逻辑总控。", type: "单选题" },
  { front: "[单选题] 17、OceanBase的产品体系中，数据库内核的兼容性基于什么？\nA.MySQL\nB.PostgreSQL\nC.完全自主研发，同时兼容MySQL和Oracle\nD.基于开源分支", back: "答案：C。\n解析：OceanBase 是蚂蚁集团完全自主研发的原生分布式数据库，不基于任何开源产品分支，并在内核层面实现了对 MySQL 和 Oracle 的高度兼容。", type: "单选题" },
  { front: "[单选题] 18、OceanBase的存储结构被称为？\nA.准内存数据库\nB.纯硬盘数据库\nC.纯内存数据库\nD.内存数据库", back: "答案：A。\n解析：OceanBase 被称为“准内存数据库”，因为它的增量修改（DML）都在内存中完成（MemTable），而基线数据存储在磁盘中（SSTable）。", type: "单选题" },
  { front: "[单选题] 19、OceanBase 可以支持极高写性能的核心存储引擎架构是？\nA. COLA\nB. LSM-TREE\nC. Key-Value\nD. BTREE", back: "答案：B。\n解析：基于 LSM-Tree（日志结构合并树）架构，OceanBase 将随机写转化为内存中的顺序写，极大地提升了写入性能。", type: "单选题" },
  { front: "[单选题] 20、OceanBase 数据库推荐使用的磁盘介质是什么？\nA. SAS 机械盘\nB. SSD 固态盘\nC. SAS 机械盘 + SSD 固态盘\nD. 磁带", back: "答案：B。\n解析：为了保证生产环境的读写性能，OceanBase 强力推荐且主要依赖 SSD 固态盘作为存储介质。", type: "单选题" },
  { front: "[单选题] 21、OceanBase 把内存中增量数据，合并到磁盘基线数据的过程称为什么？\nA. 转储\nB. 合并\nC. 刷新\nD. 压缩", back: "答案：B。\n解析：合并（Major Freeze）是指将内存中的 MemTable 增量数据与磁盘中的 SSTable 基线数据进行合并，生成新的基线 SSTable 的过程。", type: "单选题" },
  { front: "[单选题] 22、为了达到更好的压缩效果，OceanBase 一般推荐进行几次压缩？\nA. 1 次\nB. 2 次\nC. 3 次\nD. 4 次", back: "答案：B。\n解析：OceanBase 通常在合并时采用两级压缩技术（底层编码压缩 + 通用块压缩），以达到极高的数据压缩比。", type: "单选题" },
  { front: "[单选题] 23、关于 OceanBase 数据库主键特点，说法错误的是：\nA. 保证数据唯一\nB. 不能为空\nC. 强制要求用户必须建立主键\nD. 业务上可以不显式定义主键", back: "答案：C。\n解析：虽然推荐用户建立主键，但并非强制。如果用户不显式定义主键，OceanBase 会在底层隐式创建一个隐藏的主键（类似 rowid）来保证数据组织的正确性。", type: "单选题" },
  { front: "[单选题] 24、OceanBase 使用哪种机制解决读写并发冲突？\nA. MVCC\nB. Paxos 协议\nC. 全局锁\nD. 读写锁", back: "答案：A。\n解析：多版本并发控制（MVCC）机制使得读操作可以读取数据的历史版本，从而实现了读写互不阻塞，解决了读写并发冲突。", type: "单选题" },
  { front: "[单选题] 25、OceanBase 使用哪种机制保证跨节点分布式事务的原子性？\nA. 一阶段提交\nB. 两阶段提交\nC. 三阶段提交\nD. MVCC", back: "答案：B。\n解析：对于涉及多个节点的分布式事务，OceanBase 内置了优化的两阶段提交（2PC）协议来保证事务的原子性（要么全成功，要么全失败）。", type: "单选题" },
  { front: "[单选题] 26、两阶段提交协议中，谁是协调者？\nA. OB Proxy\nB. 接收请求的任意 OB Server\nC. RootService 总控服务\nD. 发起该事务的日志流 Leader 所在的 OB Server", back: "答案：D。\n解析：在 OceanBase 中，分布式事务的协调者（Coordinator）通常是该事务第一条语句所访问的数据所在的日志流 Leader，即发起该事务参与的 OBServer。", type: "单选题" },
  { front: "[单选题] 27、对于 Primary Zone 配置副本，OceanBase 支持哪种级别的容灾调度？\nA. 租户级别\nB. 数据库级别\nC. 表级别\nD. 表组级别", back: "答案：A。\n解析：Primary Zone 决定了 Leader 副本的分布偏好。在 OceanBase 中，Primary Zone 是在“租户”级别进行配置和调度的。", type: "单选题" },
  { front: "[单选题] 28、建立 table group 的主要目的是？\nA. 方便业务表按照业务功能分类\nB. 减少跨节点分布式事务\nC. SQL 优化器能够识别\nD. 更好的实现负载均衡", back: "答案：B。\n解析：Tablegroup 将经常进行 Join 的关联表绑定在一起，使得它们的对应分区调度到同一台节点上，将跨机分布式事务转化为单机事务，提升性能。", type: "单选题" },
  { front: "[单选题] 29、当集群中某节点宕机时，OceanBase 首先切换的服务级别是什么？\nA. 整个集群\nB. 租户级别\nC. 数据库级别\nD. 领导者副本的日志流 (Partition/LogStream Leader)", back: "答案：D。\n解析：节点宕机后，Paxos 协议会在秒级内自动为该节点上的所有 Leader 副本（日志流）在其他存活节点上重新选举出新的 Leader，恢复服务。", type: "单选题" },
  { front: "[单选题] 30、3个Zone，2个同城，1个异地，同城一个机房宕机，下列说法正确的是：\nA. 强一致同步延迟变大\nB. 会丢失秒级数据\nC. 集群不可用\nD. 合并业务基本不受影响", back: "答案：A。\n解析：同城机房宕机后，原本的同城多数派被打破，剩下的节点（1个同城+1个异地）仍能构成多数派继续服务。但因为同步需要跨城，强一致同步网络延迟会变大。数据不会丢失(RPO=0)。", type: "单选题" },
  { front: "[单选题] 31、如果从传统 Oracle 业务迁移到 OceanBase，需要进行实时同步，推荐使用哪个工具？\nA. OCP\nB. DataX\nC. OMS\nD. ODC", back: "答案：C。\n解析：OMS (OceanBase Migration Service) 提供了从 Oracle、MySQL 等异构数据库到 OceanBase 的全量迁移和增量实时同步功能。", type: "单选题" },
  { front: "[单选题] 32、关于 OceanBase 资源隔离，以下哪一项是正确的？\nA. 集群资源隔离\nB. 数据库级隔离\nC. schema 隔离\nD. 租户级物理隔离", back: "答案：D。\n解析：OceanBase 的多租户架构实现了租户级别的物理资源（CPU、内存）严格隔离。", type: "单选题" },
  { front: "[单选题] 33、哪个组件负责全集群资源分配、全局 DDL、集群数据合并调度等功能？\nA. OB Proxy\nB. RootService 总控服务\nC. OCP 运维平台\nD. ODC 开发者工具", back: "答案：B。\n解析：RootService（简称 RS）是 OceanBase 集群的内置总控服务，负责全局元数据管理、DDL、资源调度和合并控制。", type: "单选题" },
  { front: "[单选题] 34、哪个客户端工具可以直接连接 Oracle 租户进行业务开发？\nA. OBClient (OceanBase 客户端) / ODC\nB. 标准 MySQL 客户端\nC. OCP 运维平台\nD. Navicat", back: "答案：A。\n解析：Oracle 模式租户必须使用 OceanBase 定制的客户端（OBClient）或开发者工具（ODC）、驱动进行连接。标准 MySQL 客户端无法连接 Oracle 租户。", type: "单选题" },
  { front: "[单选题] 35、5个Zone，每个Zone有10台OB Server，一个分区日志流在集群中全部的副本数是？\nA. 10\nB. 3\nC. 6\nD. 5", back: "答案：D。\n解析：通常情况下，副本是跨 Zone 分布的，一个 Zone 内只保留该日志流的一个副本。5个 Zone 则共有 5 个副本。", type: "单选题" },
  { front: "[单选题] 36、关于 RootService 总控服务，说法正确的是：\nA. 每个Zone会有一个主控OB Server节点\nB. 每个Zone有一个主控分区日志流\nC. 整个集群只有一个主控Leader提供服务\nD. 每台OB Server都会有一个", back: "答案：C。\n解析：RootService 本质上也是一个特殊的系统内部表（__all_core 等）的 Leader 副本，整个集群只有一个 RootService Leader 提供总控服务。", type: "单选题" },
  { front: "[单选题] 37、3机房3Zone部署，关于 Root Service 说法正确的是：\nA. 整个集群只有一个主控Leader\nB. 每个机房一个主控\nC. 每个 observer 上都有 RootService提供服务\nD. Root Service 不是必须的", back: "答案：A。\n解析：无论多少个机房或 Zone，RootService 始终是由 Paxos 选举产生的一个唯一 Leader 节点来提供全局服务。", type: "单选题" },
  { front: "[单选题] 38、3个Zone，每Zone 5台OB Server，租户资源 Unit Num=4，请问有多少个节点上有该租户资源单元？\nA. 3\nB. 5\nC. 12\nD. 15", back: "答案：C。\n解析：Unit Num=4 表示该租户在每个 Zone 内部被分配了 4 个资源单元（Unit）。共有 3 个 Zone，所以总计在 4 * 3 = 12 个节点上分配了资源。", type: "单选题" },
  { front: "[单选题] 39、OceanBase 租户资源的分配方式是：内存是 ___，CPU 是 ___？\nA. 共享分配，独占分配\nB. 独占分配，共享分配\nC. 独占分配，独占分配\nD. 共享分配，共享分配", back: "答案：B。\n解析：在租户资源隔离中，内存是严格的独占分配（物理预留），不可超卖；而 CPU 是通过 cgroup 进行共享分配控制，支持超卖。", type: "单选题" },
  { front: "[单选题] 40、关于 OceanBase 集群升级，说法正确的是：\nA. 需要维护人员停业务停机\nB. 需要业务应用修改代码\nC. 支持动态轮转升级，对业务透明\nD. 必须使用高性能物理机替换", back: "答案：C。\n解析：得益于多副本和高可用架构，OceanBase 支持逐个节点的动态轮转升级（Rolling Upgrade），升级过程中业务不受影响（零停机）。", type: "单选题" },
  { front: "[单选题] 41、哪个平台提供图形化界面，支持集群管理、租户管理、性能监控和告警？\nA. ODC\nB. OCP\nC. OB Proxy\nD. OB Server", back: "答案：B。\n解析：OCP (OceanBase Control Platform) 是官方的白屏化全生命周期运维管理平台。", type: "单选题" },
  { front: "[单选题] 42、关于全能副本，说法正确的是：\nA. 有 MemTable 和 SSTable，参与投票，可快速恢复为 leader\nB. 没有日志\nC. 不参与投票\nD. 没有数据只有日志", back: "答案：A。\n解析：全能副本（Full Replica）包含完整的日志和数据（MemTable + SSTable），参与 Paxos 投票选举，并且可以被选举为 Leader 提供读写服务。", type: "单选题" },
  { front: "[单选题] 43、OceanBase 支持哪些分区类型？\nA. Hash、List、Range\nB. Hash、List\nC. 只有 Range\nD. 只有 Hash", back: "答案：A。\n解析：OceanBase 支持主流的关系型数据库分区策略，包括 Range（范围）、List（列表）和 Hash（哈希）等一级和二级分区。", type: "单选题" },
  { front: "[单选题] 44、OceanBase 有哪些主要的副本类型？\nA. 全能副本、日志副本、只读副本\nB. 全能副本、数据副本\nC. 读写副本、只读副本\nD. 主副本、备副本", back: "答案：A。\n解析：在 V4.0 及之前的版本中，常见的副本类型包括全能副本、仅同步日志不存数据的日志副本，以及不参与投票的只读副本（Readonly Replica）。", type: "单选题" },
  { front: "[单选题] 45、OceanBase 商业版支持哪种数据库 SQL 语法兼容？\nA. MySQL\nB. 仅 Oracle\nC. 仅 DB2\nD. 同时兼容 MySQL 和 Oracle", back: "答案：D。\n解析：OceanBase 的多租户架构允许在同一个集群内创建 MySQL 兼容模式租户和 Oracle 兼容模式租户。", type: "单选题" },

  // -------- 多选题 --------
  { front: "[多选题] 33、OceanBase 能够实现在普通 PC 服务器上的金融级高可用性，其依赖的核心技术有哪些？\nA. Multi-Paxos 协议\nB. 多副本机制\nC. 共享存储架构\nD. 强一致性同步", back: "答案：A、B、D。\n解析：OceanBase 采用无共享（Shared-Nothing）架构，不依赖共享存储。其高可用依赖于多副本、Multi-Paxos 协议以及副本间的强一致性日志同步。", type: "多选题" },
  { front: "[多选题] 34、在OceanBase V4.0之后，关于日志流和数据分片的关系，以下说法正确的是：\nA. 一个数据分片(Partition)对应一个日志流\nB. 多个数据分片可以共享同一个日志流\nC. 日志流是系统进行 Paxos 同步的基本单位\nD. 数据分片不再参与 Paxos 投票选举", back: "答案：B、C、D。\n解析：V4.0 引入了单机一体化架构，将 Paxos 同步的基本单位从 Partition 提升到了日志流（Log Stream），多个分区共享一个日志流，大大降低了网络和 CPU 开销。", type: "多选题" },
  { front: "[多选题] 35、OceanBase 的多租户架构，主要实现了以下哪些层面的隔离？\nA. 内存隔离\nB. CPU 隔离\nC. 权限隔离\nD. 操作系统内核隔离", back: "答案：A、B、C。\n解析：多租户在数据库进程内部实现了 CPU、内存、数据和权限的严格隔离，但并未做到 OS 操作系统的内核级别虚拟化隔离（不是 Docker）。", type: "多选题" },
  { front: "[多选题] 36、创建一个租户的资源单元 Unit Num 为 3，意味着什么？\nA. 在一个 Zone 内会分配 3 个 Unit\nB. 这 3 个 Unit 必须分布在同一个 Zone 的不同 OBServer 上\nC. 该租户在集群中每个 Zone 都有 3 个 Unit\nD. 该租户最多只能有 3 个 Unit", back: "答案：A、B、C。\n解析：Unit Num 是租户在每个 Zone 中的资源单元数量，且同一个租户的多个 Unit 不能分布在同一台 OBServer 上（必须分散到同 Zone 不同节点）。", type: "多选题" },
  { front: "[多选题] 37、OceanBase 的 Tablegroup 功能的作用包括：\nA. 将业务上强相关的表聚集在相同节点\nB. 将关联表同名分区聚集，减少跨节点网络通信\nC. 提高复杂 JOIN 查询的性能\nD. 自动对数据进行加密", back: "答案：A、B、C。\n解析：Tablegroup 主要用于分布式调度和本地化 Join 优化，与数据加密无关。", type: "多选题" },
  { front: "[多选题] 38、将传统 Oracle/MySQL 数据库平滑迁移到 OceanBase，通常需要哪些工具和机制配合？\nA. OMS 数据迁移同步平台\nB. OMA 兼容性评估工具\nC. OceanBase 的高度语法兼容性\nD. 手工重写所有 SQL", back: "答案：A、B、C。\n解析：借助 OMA 评估、OMS 同步以及内核的原生高兼容性，可以实现平滑迁移，基本不需要手工重写所有 SQL。", type: "多选题" },
  { front: "[多选题] 39、OceanBase 的存储引擎通过什么机制保证数据持久性？\nA. WAL (Write-Ahead Logging) 机制\nB. Redo-log 实时落盘\nC. 多数派节点同步确认\nD. 内存数据立即全量刷盘", back: "答案：A、B、C。\n解析：OceanBase 不要求内存数据立即刷盘（DML 只修改内存），而是通过 WAL 机制，确保 Redo-log 同步到多数派并落盘，从而保证数据断电不丢失。", type: "多选题" },
  { front: "[多选题] 40、分布式数据库在处理事务时引发的分布式一致性问题，OceanBase 是如何解决的？\nA. 全局时间戳 (GTS)\nB. 两阶段提交 (2PC)\nC. MVCC 多版本并发控制\nD. 锁表机制阻止并发", back: "答案：A、B、C。\n解析：通过 GTS 提供全局快照版本号，MVCC 提供非阻塞读，2PC 保证跨机原子性。OceanBase 使用行锁而非粗暴的锁表机制来控制并发。", type: "多选题" },
  { front: "[多选题] 41、OceanBase 的 SQL 引擎支持哪些特性？\nA. 处理包含约束和视图的 DML 语句\nB. 成本基优化器 (CBO)\nC. 规则基优化器 (RBO)\nD. 分布式执行计划生成", back: "答案：A、B、C、D。\n解析：OceanBase 的 SQL 引擎功能完善，包含词法/语法解析、查询重写（RBO）以及基于代价的查询优化（CBO），并能生成并行分布式执行计划。", type: "多选题" },
  { front: "[多选题] 42、关于 OceanBase 多副本架构，以下说法正确的是：\nA. 应用层看到的只是一份数据\nB. 强一致性读写操作必须由 Leader 副本处理\nC. 弱一致性读可以由 Follower 副本处理\nD. 应用服务器可以直接向任何 Follower 副本进行写操作", back: "答案：A、B、C。\n解析：多副本对应用完全透明（A）；写操作和强一致读必须找 Leader（B）；开启弱一致性读后可以读 Follower（C）；应用不能直接向 Follower 写数据（D错）。", type: "多选题" },

  // -------- 判断题 --------
  { front: "[判断题] 48、系统参数(Parameters)的生效范围只能是集群范围，不能是租户范围。", back: "答案：错误。\n解析：系统参数（Parameters）可以分为集群级别（Cluster Level）和租户级别（Tenant Level）。", type: "判断题" },
  { front: "[判断题] 49、ALTER SYSTEM SET 语句既可以修改集群参数，也可以修改租户参数。", back: "答案：正确。\n解析：通过在系统租户或普通租户下执行，并结合 tenant='xxx' 等条件，可以修改不同级别的参数。", type: "判断题" },
  { front: "[判断题] 50、OceanBase 是集中式架构与分布式架构的结合体，具有中心控制节点用于数据存储。", back: "答案：错误。\n解析：OceanBase 是完全的对等节点无共享（Shared-Nothing）分布式架构，RootService 只是逻辑总控，数据分散存储在所有节点，没有传统的集中式数据存储节点。", type: "判断题" },
  { front: "[判断题] 51、OceanBase 在处理跨节点分布式事务时，采用了改进的两阶段提交（2PC）协议，并实现了协调者无状态化。", back: "答案：正确。\n解析：OceanBase 优化了传统的 2PC，协调者信息持久化在日志中。若协调者宕机，新的 Leader 接管后可以快速恢复状态，解决了传统 2PC 的单点故障问题。", type: "判断题" },
  { front: "[判断题] 52、在 OceanBase 中，内存（Memory）资源的分配是独占的，CPU 资源则是共享的，因此 CPU 可以超卖。", back: "答案：正确。\n解析：租户的内存资源是严格物理隔离和物理预留的，不可超卖；而 CPU 使用 cgroup 进行控制，支持配置最大和最小 CPU 进行超卖共享。", type: "判断题" },
  { front: "[判断题] 53、如果一个集群由 3 个 Zone 组成，那么该集群的数据至少会有 3 个全能副本。", back: "答案：正确。\n解析：通常情况下，每个 Zone 会包含数据的一个副本，3 个 Zone 默认构成 3 副本的高可用架构，保障机房级容灾。", type: "判断题" },
  { front: "[判断题] 54、OMS (OceanBase Migration Service) 仅支持单向的数据全量迁移，不支持增量实时同步。", back: "答案：错误。\n解析：OMS 不仅支持全量数据迁移，还支持基于增量日志解析的实时数据同步和数据校验，是实现业务不停机割接的关键。", type: "判断题" },
  { front: "[判断题] 55、OBProxy 负责将客户端的 SQL 路由到目标数据所在的 OBServer，它本身并不存储任何业务数据。", back: "答案：正确。\n解析：OBProxy 是一个无状态的反向代理服务，只负责根据内部路由表和 SQL 语义将请求转发到正确的节点，不持久化任何业务数据。", type: "判断题" },
  { front: "[判断题] 56、OceanBase 社区版完全免费，且与企业版在核心分布式事务处理和高可用架构上完全一致。", back: "答案：正确。\n解析：社区版开源了 100% 的核心架构代码，包含了核心的分布式引擎和 Paxos 高可用能力。主要区别在于企业版提供了 Oracle 兼容性和高级企业级安全等特性。", type: "判断题" },
  { front: "[判断题] 57、在 OceanBase 的 LSM-Tree 存储引擎中，数据更新会直接修改磁盘上的数据块以保证实时性。", back: "答案：错误。\n解析：LSM-Tree 的核心设计就是避免随机写。数据的更新和插入是追加写入内存（MemTable），不会直接修改磁盘数据。磁盘上的数据（SSTable）是只读的，通过后台合并生成新的 SSTable 来更新。", type: "判断题" }
];

batch3.forEach(item => {
    if (item.type === '单选题') singleQs.push(item);
    if (item.type === '多选题') multiQs.push(item);
    if (item.type === '判断题') trueFalseQs.push(item);
});

writeCSV('单选题.csv', singleQs);
writeCSV('多选题.csv', multiQs);
writeCSV('判断题.csv', trueFalseQs);

console.log('Batch 3 appended successfully. Total questions added: ' + batch3.length);
