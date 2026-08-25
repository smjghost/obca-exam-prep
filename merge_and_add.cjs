const fs = require('fs');
const path = require('path');

// We have papaparse installed
const Papa = require('papaparse');

function parseCSV(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const results = Papa.parse(content, { header: true, skipEmptyLines: true });
    return results.data.filter(r => r['front']);
}

function writeCSV(filePath, data) {
    const csv = Papa.unparse(data, { quotes: true });
    fs.writeFileSync(filePath, csv, 'utf-8');
}

const publicDir = path.join(__dirname, 'public');

let singleQs = [...parseCSV(path.join(publicDir, '单选题.csv')), ...parseCSV(path.join(publicDir, 'not_exist_file.csv'))];
let multiQs = [...parseCSV(path.join(publicDir, '多选题.csv')), ...parseCSV(path.join(publicDir, 'not_exist_file.csv'))];
let trueFalseQs = [...parseCSV(path.join(publicDir, '判断题.csv')), ...parseCSV(path.join(publicDir, 'not_exist_file.csv'))];

const batch3 = [
    { front: "[多选题] 14、系统内置视图oceanbase.gv$OB_SQL_AUDIT包含以下哪些信息?\nA.SQL类型及执行次数\nB.SQL的执行计划\nC.等待的时间及次数\nD.执行统计信息", back: "答案：A、C、D。\n解析：gv$OB_SQL_AUDIT 记录了 SQL 审计信息，包括执行时间、等待事件、统计信息等，但不包含具体的逻辑/物理执行计划（需通过 explain 或 plan cache 视图查看）。", type: "多选题" },
    { front: "[单选题] 15、关于使用LOAD DATA命令，下列说法错误的是：\nA、客户端使用OBProxy连接数据库执行LOAD DATA命令,把OceanBase集群中一台OBServer节点上的csv文件导入到数据库中。\nB、使用LOAD DATA命令前,需要授予该文件给数据库的读取权限。\nC、LOAD DATA支持本地路径和远程路径两种方式。\nD、LOAD DATA使用本地路径时,需要指定direct 关键字的Hint", back: "答案：A。\n解析：LOAD DATA 默认是从“客户端”所在机器或者连接的节点读取文件。如果是通过 OBProxy 连入，无法确定最终连接的是哪台 OBServer，因此如果是本地文件导入，通常需要客户端直连目标 OBServer，或使用网络存储/OSS。", type: "单选题" },
    { front: "[多选题] 16、关于SHARDING模式为PARTITION和TABLEGROUP,下列说法正确的是：\nA、要求表组内所有表的分区方式必须相同\nB、要求表组内所有表的分区数量必须相同\nC、表组内所有表的分区会聚集在相同的OBserver节点上\nD、如果不将表放在一个表组里，即使全都是单表查询,也是一个跨机事务", back: "答案：A、C。\n解析：加入 Tablegroup 的表必须有相同的分区策略（包括分区类型、分区数等），系统会将对应分区调度到相同节点以实现本地关联（Local Join）。", type: "多选题" },
    { front: "[单选题] 17、下列哪项日常运维操作不能通过OCP来执行?\nA、重启OBserver\nB、升级硬件\nC、替换OBserver\nD、升级集群", back: "答案：B。\n解析：OCP 是软件层面的自动化运维平台，支持重启、替换、升级软件，但物理硬件的升级（如插拔内存、更换CPU）无法通过 OCP 执行。", type: "单选题" },
    { front: "[单选题] 18、下列哪一项不属于OceanBase内核提供的监控诊断工具?\nA、OAS\nB、WR 和ASH\nC、SQL Trace\nD、系统内部视图", back: "答案：A。\n解析：WR、ASH、SQL Trace 和内部视图都属于数据库内核自身提供的诊断能力；OAS（OceanBase 自动调优服务）等属于周边生态平台。", type: "单选题" },
    { front: "[多选题] 19、以下哪些是 OceanBase 的架构特性?\nA 原生分布式架构\nB 存储分布式一体化\nC 支持多租户架构\nD 能很好聚成 OLAP 和 OLTP 执行引擎", back: "答案：A、B、C、D。\n解析：OceanBase 是原生分布式架构，支持多租户隔离，且是 HTAP 数据库，能同时处理 OLTP 和 OLAP 负载。", type: "多选题" },
    { front: "[多选题] 20、以下哪些是OceanBase分布式数据库的优势?\nA 数据不丢失\nB 自动故障恢复\nC 高性价比\nD 支持超大规模业务集群", back: "答案：A、B、C、D。\n解析：基于 Paxos 的 RPO=0 数据不丢失和 RTO秒级恢复；通过极高压缩比和普通PC服务器带来高性价比；原生分布式架构支持超大规模集群扩展。", type: "多选题" },
    { front: "[多选题] 21、在OceanBase V4 版本,租户的类型包含哪些?\nA 临时租户\nB 用户租户\nC Meta租户\nD 系统租户", back: "答案：B、C、D。\n解析：V4 版本中，每个用户租户会自动配套一个 Meta 租户存放自身元数据，加上系统租户，主要为这三大类。", type: "多选题" },
    { front: "[单选题] 22、假设一个5节点的OceanBase集群,最多允许几个节点故障而集群依然可用?\nA.1 B.2 C.3 D.4", back: "答案：B。\n解析：根据 Paxos 多数派协议，5 副本集群的多数派是 3，因此最多允许 5-3 = 2 个节点故障。", type: "单选题" },
    { front: "[多选题] 23、OceanBase数据库的多租户架构主要实现了哪些隔离?\nA 资源隔离\nB 数据隔离\nC 权限和权限管理\nD 操作系统隔离", back: "答案：A、B、C。\n解析：多租户在数据库内部实现了严格的资源、数据和权限隔离，但并没有做到 OS 操作系统级别的虚拟化隔离（如容器/虚拟机）。", type: "多选题" },
    { front: "[多选题] 24、以下哪个选项是OceanBase数据库SQL引擎的特性?\nA 支持标准 SQL 语法\nB 高度兼容 MySQL和Oracle 数据库\nC 提供分布式事务服务\nD 支持在线DDL操作", back: "答案：A、B、D。\n解析：分布式事务服务是由“事务引擎”负责的，而 SQL 引擎主要负责 SQL 的解析、优化（执行计划生成）和执行调度。有些题目将C也列为特性，但严格上C属于事务引擎。", type: "多选题" },
    { front: "[多选题] 25、在OceanBase数据库中,关于转储和合并的说法,下面哪些是正确的?\nA 转储是将MemTable中的数据写入到磁盘的过程\nB 合并是将当前数据及生成的多个级别的ssTable数据进行归并,形成新的基线SSTable的过程\nC 转储由系统自动触发,并在集群统一执行;\nD 合并只能手动触发,无法自动触发,并在集群统一执行", back: "答案：A、B。\n解析：转储是单节点行为，将内存数据落盘；合并是全局行为。二者都可以自动或手动触发。", type: "多选题" },
    { front: "[多选题] 26、OceanBase数据库使用LSM Tree作为存储结构能带来哪些好处?\nA、能够对数据加密,保证数据安全\nB、能够将随机写转为顺序写,从而保护SSD硬盘的寿命\nC、数据更新及插入在内存中,通过批量转储和合并等操作顺序写入磁盘,提高写操作性能\nD使用 Key-Value 的存储结构,能够很好的支持压缩,提供高压缩比,节约存储成本", back: "答案：B、C、D。\n解析：LSM-Tree 核心优势在于化随机写为顺序写、极高压缩比和优秀的写入性能。加密是透明加密 (TDE) 功能，非 LSM-Tree 直接带来的好处。", type: "多选题" },
    { front: "[多选题] 27、通常可以通过哪些方式来安装OceanBase数据库?\nA. OBD命令行安装\nB. 通过OCP安装\nC. 源码编译部署\nD. 通过 ob-operator 在 Kubernetes 容器中部署", back: "答案：A、B、D。\n解析：OceanBase 提供了 OBD 本地部署、OCP 白屏化部署以及 Kubernetes 容器化部署（ob-operator）。", type: "多选题" },
    { front: "[多选题] 28、OBServer节点的默认工作目录为/home/admin/oceanbase,关于该目录说明正确的是：\nA. log 目录内存放着所有的运行日志\nB. etc 目录内有集群配置文件\nC. audit 目录存放着审计日志\nD. bin 目录存放着 observer binary 文件", back: "答案：A、B、D。\n解析：OceanBase 的日志默认在 log 目录，配置在 etc 目录，二进制程序在 bin 目录。没有专门名为 audit 的系统默认目录（审计日志通常在 log 目录下）。", type: "多选题" },
    { front: "[多选题] 29、在 OceanBase 数据库中,关于主键约束哪些是正确的?\nA 允许存在空值,但不允许空值唯一\nB 必须保证全局唯一\nC OceanBase会自动为主键创建唯一索引\nD 如果没有主键,数据按照插入顺序存储", back: "答案：B、C。\n解析：主键必须全局唯一且非空；系统会自动为其创建唯一索引。如果不显式定义主键，OceanBase 会隐式创建一个隐藏的主键（类似 rowid）。", type: "多选题" },
    { front: "[多选题] 30、Explain命令支持的语法有：\nA. EXPLAIN BASIC\nB. EXPLAIN EXTENDED\nC. EXPLAIN STATS\nD. EXPLAIN DETAIL", back: "答案：A、B、D。\n解析：OceanBase 支持通过 BASIC、EXTENDED、FORMAT 等参数控制 EXPLAIN 输出的内容格式，通常不包括 STATS（MySQL语法不支持 STATS）。", type: "多选题" },
    { front: "[多选题] 31、为业务系统创建索引时,选择索引列需要考虑的因素有哪些?\nA. 高频查询条件\nB. 选择性高的列\nC. 读写分离需求\nD. 频繁更新的列", back: "答案：A、B。\n解析：应当为高频查询和区分度（选择性）高的列建立索引。频繁更新的列建索引会增加维护开销，读写分离主要靠副本路由实现。", type: "多选题" },
    { front: "[多选题] 32、通过OCP的SQL诊断能查看到哪些信息?\nA SQL文本\nB 响应时间\nC 执行计划\nD SQL失败次数", back: "答案：A、B、C、D。\n解析：OCP 的 SQL 诊断面板可以查看到 SQL 文本、平均耗时、执行计划、错误/失败次数以及等待事件等丰富的统计信息。", type: "多选题" },
    { front: "[判断题] 33、OceanBase 能够实现在普通 PC 服务器上的金融级高可用性。", back: "答案：正确。\n解析：OceanBase 通过 Multi-Paxos 协议在普通 PC 服务器集群上实现了 RPO=0 的金融级高可用灾备。", type: "判断题" },
    { front: "[判断题] 34、在OceanBase中,日志流和数据分片是一一对应的,一个数据分片就有一个日志流。", back: "答案：错误。\n解析：在 V4.0 之后，引入了日志流概念，多个数据分片（Partition）可以共享同一个日志流（Log Stream），大大降低了系统的资源开销。", type: "判断题" },
    { front: "[判断题] 35、OceanBase 的租户逻辑上对应一个数据库实例,每个租户独占系统的存储和计算资源,类似于Docker容器的资源隔离。", back: "答案：正确。\n解析：租户是 OceanBase 中的资源隔离单位，对用户而言，一个租户就像是一个独立的数据库实例（MySQL 或 Oracle）。", type: "判断题" },
    { front: "[判断题] 36、在OceanBase中,创建一个租户的资源单元 Unit Num为3,那么一个Zone内会有3个不同的OBSerer作为该租户的资源分配单元。", back: "答案：正确。\n解析：Unit Num=3 表示租户在一个 Zone 中会分配 3 个 Unit，这些 Unit 必须分布在不同的 OBServer 节点上。", type: "判断题" },
    { front: "[判断题] 37、OceanBase的Tablegroup功能允许将业务上强相关的表聚集在相同的节点。", back: "答案：正确。\n解析：表组（Tablegroup）的作用就是将关联表（通常是 Join 频繁的表）或其同名分区聚集调度到同一个节点上，避免跨节点网络通信。", type: "判断题" },
    { front: "[判断题] 38、OceanBase数据库与Oracle/MySQL数据库有较大的不同,无法将OracIe/MYSQL数据库平滑迁移到OceanBase数据库。", back: "答案：错误。\n解析：OceanBase 高度兼容 MySQL 和 Oracle，结合自研的 OMS 工具，可以实现从 MySQL/Oracle 的平滑数据迁移和业务割接。", type: "判断题" },
    { front: "[判断题] 39、OceanBase数据库的存储引擎通过WAL(Write-Ahead Logging)机制确保redo-log实时落盘,保证数据持久性。", back: "答案：正确。\n解析：事务提交时，必须先将 redo log 同步并落盘（并且多数派确认），然后才能返回客户端成功，确保数据断电不丢失。", type: "判断题" },
    { front: "[判断题] 40、分布式数据库在处理事务时引发的分布式一致性问题会导致不同节点并发读取到不一致的数据。", back: "答案：错误。\n解析：OceanBase 通过全局时间戳（GTS）和 MVCC 多版本并发控制机制，保证了在分布式环境下多节点间的全局读一致性。", type: "判断题" },
    { front: "[判断题] 41、OceanBase数据库的SQL引擎不支持对包含约束和视图的DML语句进行处理。", back: "答案：错误。\n解析：OceanBase 的 SQL 引擎完全支持处理带有各类约束的表，并且支持复杂视图（包括可更新视图）上的 DML 操作。", type: "判断题" },
    { front: "[判断题] 42、OceanBase 数据库是多副本架构,OceanBase 的业务应用服务器可以直接进行多副本的读写从而提高集群高可用性。", back: "答案：错误。\n解析：OceanBase 的多副本是底层存储透明实现的，应用层看到的只是一份数据。写操作必须由 Leader 副本处理；弱一致性读可由 Follower 处理。应用连接通常通过 OBProxy，不直接读写所有副本。", type: "判断题" },
    { front: "[判断题] 43、OCP只支持单节点的部署方式。", back: "答案：错误。\n解析：对于生产环境，OCP 支持多节点高可用（HA）部署，避免单点故障导致管控平台不可用。", type: "判断题" },
    { front: "[判断题] 44、OBDUMPER是一个使用Java 语言开发的数据导出工具,支持连接OceanBase 数据库。用户可以使用该工具将OceanBase中的数据导出为SQL格式和CSV格式的数据文件。", back: "答案：正确。\n解析：OBLOADER 和 OBDUMPER 是 OceanBase 官方提供的基于 Java 开发的导数工具集，支持导出/导入 SQL、CSV 等多种格式。", type: "判断题" },
    { front: "[判断题] 45、在OceanBase中,转储(将内存数据写到磁盘)的触发条件只有一种设定,即内存达到阈值。", back: "答案：错误。\n解析：转储除了内存达到高水位触发外，还可以通过手动命令（alter system minor freeze）或系统定时触发。", type: "判断题" },
    { front: "[判断题] 46、OceanBase数据库的租户资源池可以动态调整,以满足不同业务资源需求。", back: "答案：正确。\n解析：租户资源池（Resource Pool）支持在线动态扩缩容，无论是调大 Unit 规格还是增加 Unit 数量，均不会中断业务。", type: "判断题" },
    { front: "[判断题] 47、OceanBase全链路追踪的结果只能通过OCP查看,不支持函数(或命令行)查看。", back: "答案：错误。\n解析：全链路追踪的结果除了可以在 OCP 界面上可视化查看外，也直接打印在 trace.log 等日志文件中，可以命令行或 SQL 形式查看。", type: "判断题" },
    { front: "[单选题] 1、OceanBase 使用什么协议达成高可用和强一致性？\nA. 主从同步 + Paxos 协议\nB. 读写分离 + 高可用同步协议\nC. 日志同步 + 高可用同步协议\nD. 多副本 + Paxos 协议", back: "答案：D。\n解析：OceanBase 使用无共享的多副本架构，各副本之间通过 Multi-Paxos 分布式一致性协议进行日志同步，实现 RPO=0。", type: "单选题" },
    { front: "[单选题] 2、OceanBase 默认以什么为单位组建 Paxos 协议组？\nA. 租户\nB. 数据库\nC. 表\nD. 分区 (或日志流)", back: "答案：D。\n解析：在早期的架构中，OceanBase 以分区（Partition）为单位组建 Paxos 组；在 V4.0 及以后，是以日志流（Log Stream）为单位。题目若是老题库，则选分区。", type: "单选题" },
    { front: "[单选题] 3、当应用向数据库写入事务时，默认会同步等待什么日志同步到多数派节点？\nA. Redo-Log 日志\nB. 系统日志\nC. Undo-log 日志\nD. 审计信息", back: "答案：A。\n解析：事务提交时，必须等待 Redo-Log （重做日志）通过 Paxos 协议同步到多数派（Majority）节点并落盘后，才返回给应用提交成功。", type: "单选题" },
    { front: "[单选题] 4、OceanBase 内核采用的选举协议是？\nA. Paxos\nB. Raft\nC. Zookeeper\nD. ZAB", back: "答案：A。\n解析：OceanBase 实现了自主研发的基于 Multi-Paxos 算法的分布式强一致性协议。", type: "单选题" },
    { front: "[单选题] 5、管理员可以通过哪个命令创建资源池？\nA. create resource unit\nB. create resource pool\nC. create tenant\nD. create database", back: "答案：B。\n解析：创建资源池的 DDL 语句是 CREATE RESOURCE POOL，通常流程是先建 Unit（资源单元模板），再建 Pool，最后分配给 Tenant。", type: "单选题" },
    { front: "[单选题] 6、OceanBase 不支持什么操作系统？\nA. CentOS\nB. Windows\nC. 统信操作\nD. 麒麟操作", back: "答案：B。\n解析：OceanBase 目前只能部署在 Linux 操作系统上（如 CentOS、RedHat、银河麒麟、统信UOS等），不支持 Windows。", type: "单选题" },
    { front: "[单选题] 7、OceanBase 一般用户的登录格式？\nA. 用户名@租户名，例如 root@sys\nB. 租户名@用户名，例如 sys@root\nC. 用户名@数据库名，例如 root@oceanbase\nD. 数据库名@用户名，例如 oceanbase@root", back: "答案：A。\n解析：OceanBase 为了区分不同租户的用户，直连（或通过直连端口）登录格式为 `用户名@租户名`。如果是通过 OBProxy 登录，通常是 `用户名@租户名#集群名`。", type: "单选题" },
    { front: "[单选题] 8、Linux 操作系统一般创建什么用户安装 OceanBase？\nA. root\nB. obuser\nC. observer\nD. admin", back: "答案：D。\n解析：在阿里/蚂蚁的传统部署规范中，OceanBase 通常推荐使用 `admin` 用户进行安装部署，而非直接使用 root 用户（出于安全考虑）。", type: "单选题" },
    { front: "[单选题] 9、ConfigServer(config url)主要是给以下哪个组件提供的？\nA. ODC\nB. OCP\nC. OMS\nD. OBProxy", back: "答案：D。\n解析：OBProxy 作为代理路由，需要知道集群的节点列表和状态。它可以通过访问 ConfigServer 动态获取集群中 RootService 的位置信息。", type: "单选题" },
    { front: "[单选题] 10、部署 OceanBase 集群时，各 OBServer 间 RPC 时钟同步时间偏移最多？\nA. 1 毫秒\nB. 10 毫秒\nC. 100 毫秒\nD. 200 毫秒", back: "答案：C。\n解析：OceanBase 强依赖时钟同步（NTP/Chrony）以生成全局时间戳。节点间时钟偏差过大（通常超过 100ms）会导致事务不可用或集群异常。", type: "单选题" },
    { front: "[单选题] 11、\"major_freeze_duty_time\" 设置为 \"02:00\" 意味着什么？\nA. 每天凌晨2点，自动触发一次转储操作\nB. 每天凌晨2点，自动触发一次合并操作\nC. 每天凌晨2点，自动触发一次内存清理操作\nD. 每天凌晨2点，自动触发一次数据恢复操作", back: "答案：B。\n解析：`major_freeze_duty_time` 参数用于设置系统每天自动触发全局大合并（Major Freeze）的时间，通常设在业务低峰期。", type: "单选题" },
    { front: "[单选题] 12、通过哪个命令可以查询系统参数？\nA. show parameters like '%<pattern>%';\nB. alter system set <name>=<value>;\nC. show variables like '%<pattern>%';\nD. set @@global.<name>=<value>;", back: "答案：A。\n解析：在 OceanBase 中，`show parameters` 用于查看集群/租户级别的系统配置项（Parameters）；而 `show variables` 用于查看兼容 MySQL 模式的系统变量（Variables）。", type: "单选题" },
    { front: "[单选题] 13、OceanBase 是一个什么类型的数据库？\nA. 内存式数据库\nB. NoSQL 数据库\nC. 分布式关系型数据库\nD. 图数据库", back: "答案：C。\n解析：OceanBase 是一款原生的企业级分布式关系型数据库（RDBMS），兼具 NoSQL 的高扩展性和关系型数据库的强一致性。", type: "单选题" },
    { front: "[多选题] 14、以下哪些是RootService的作用？\nA 资源管理\nB 负载均衡\nC 路由\nD 总控服务", back: "答案：A、B、D。\n解析：RootService 是集群的“总控”，负责租户资源分配、系统 Schema 管理、节点心跳与负载均衡调度。但客户端 SQL 的路由是由 OBProxy 负责的。", type: "多选题" }
];

batch3.forEach(q => {
    if (q.type === '单选题') singleQs.push(q);
    if (q.type === '多选题') multiQs.push(q);
    if (q.type === '判断题') trueFalseQs.push(q);
});

writeCSV(path.join(publicDir, '单选题.csv'), singleQs);
writeCSV(path.join(publicDir, '多选题.csv'), multiQs);
writeCSV(path.join(publicDir, '判断题.csv'), trueFalseQs);
console.log('Merge complete.');
