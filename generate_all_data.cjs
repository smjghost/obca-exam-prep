const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const allData = [
  // ---------------- 单选题 ----------------
  { front: "[单选题] 1、使用 Docker 部署的 OceanBase 集群可以作为MetaDB，OceanBase哪些产品线会把元数据库建在部署的这套产品需要MetaDB?\nA、OCP\nB、OBProxy\nC、OAT\nD、OMS", back: "答案：A。\n解析：OCP 在部署时需要一个后台数据库（MetaDB）来存储集群管理、监控指标和告警等元数据信息。", type: "单选题" },
  { front: "[单选题] 6、关于 OceanBase 的核心技术，下列说法错误的是：\nA. OceanBase 采用分布式架构实现了节点的高可用，数据在分布式的集群间会自动备份。\nB. OceanBase 具有极高压缩比...\nC. OceanBase 分布式能够提供机房级高可用...\nD. OceanBase 支持 HTAP 混合负载...", back: "答案：B（或A）。\n解析：底层是基于 Paxos 的多副本强同步，而非传统意义的备份。此外单机分布式一体化使得成本更低。标准题库通常选A或指出压缩比相关描述错误。", type: "单选题" },
  { front: "[单选题] 7、关于 OceanBase 的产品体系，下列说法错误的是：\nA. OMS 为 OceanBase 提供数据同步工具...\nB. OMA 为 OceanBase 数据库提供数据迁移评估工具，可以实现一站式数据库迁移。\nC. OCP 为 OceanBase 提供运维管理平台工具。\nD. OAS 为 OceanBase 提供自动调优服务工具。", back: "答案：B。\n解析：OMA 主要是“迁移评估工具”；“一站式数据库迁移”功能是由 OMS 负责执行的。", type: "单选题" },
  { front: "[单选题] 8、关于 OceanBase 的核心特点，下列说法错误的是：\nA. OceanBase 既然为大型核心业务系统设计，那么就不适合小微型企业使用。\nB. OceanBase 分布式数据库提供横向弹性扩展...\nC. OceanBase 分布式能够兼容 MySQL 和 Oracle...\nD. OceanBase 分布式数据库要做到数据多副本，所以对存储成本非常高。", back: "答案：A 或 D（通常选D或多选）。\n解析：OceanBase 单机分布式一体化支持小微企业低成本起步。且基于 LSM-Tree，数据压缩比极高，多副本不仅没推高成本，反而降低了总存储成本。", type: "单选题" },
  { front: "[单选题] 9、关系型数据库的发展经历了巨变，下列说法错误的是：\nA 从集中式走向分布式...\nB 与集中式数据库相比，分布式数据库主要关注的是更高的扩展性，而在高可用能力上没有特别的优势。\nC 使用分布式架构的分布式数据库系统能很好地处理复杂 SQL 查询和分析。\nD 原生分布式数据库不同于分布式中间件...", back: "答案：B。\n解析：分布式数据库不仅关注高扩展性，其核心优势之一就是利用 Paxos 等协议提供了比集中式（主备复制）更强的高可用能力（RPO=0，秒级 RTO）。", type: "单选题" },
  { front: "[单选题] 6、假设一个集群有3个 Zone，每个 Zone 有5台 OBServer，那么一个日志流在这个集群中全部的副本数是几个？\nA. 3 B. 5 C. 8 D. 15", back: "答案：A。\n解析：OceanBase 的数据副本是跨 Zone 分布的，通常一个 Zone 包含一个副本，用于容灾。因此 3 个 Zone 就是 3 个副本。", type: "单选题" },
  { front: "[单选题] 7、假设一个集群有3个 Zone，每个 Zone 有5台 OBServer，创建一个租户的资源池 Unit Num=3，该租户在集群中多少个节点上有该租户的资源单元？\nA. 3 B. 5 C. 9 D. 15", back: "答案：C。\n解析：Unit Num=3 表示该租户在每个 Zone 内部分配 3 个资源单元（Unit）。集群共 3 个 Zone，总计在 3 * 3 = 9 个节点上分配了资源。", type: "单选题" },
  { front: "[单选题] 8、OceanBase 没有实现以下哪种资源的租户隔离？\nA. CPU B. 内存 C. IOPS D. 网络带宽", back: "答案：D。\n解析：OceanBase 实现了租户级的 CPU 和 内存严格物理隔离，并支持部分的 IOPS 隔离，但目前尚未实现严格的网络带宽隔离。", type: "单选题" },
  { front: "[单选题] 9、RootService 是 OceanBase 的总控服务，以下哪个不是 RootService 的功能？\nA. 资源管理 B.路由管理 C. 负载均衡 D. Schema 管理", back: "答案：B。\n解析：路由管理由 ODP (OBProxy) 负责，它负责解析 SQL 并将其路由到正确的 OBServer。RootService 负责集群全局资源、负载均衡和 Schema 等。", type: "单选题" },
  { front: "[单选题] 10、关于总控服务，以下哪个说法是错误的？\nA. 总控服务在所有全能副本和日志副本中通过 Paxos 协议选举产生。\nB. 没有 MemTable 和 SSTable，资源占用很小。\nC. 如果总控服务发生宕机，集群会自动重新选举出 Leader 提供服务。\nD. 如果集群全部节点宕机，重启时总控服务需要人工介入才能恢复。", back: "答案：D。\n解析：集群全部节点宕机后重启，只要有多数派节点存活并启动，Paxos 协议就会自动恢复 RootService Leader 选举，不需要人工干预。", type: "单选题" },
  { front: "[单选题] 11、关于 OceanBase V4日志流的副本类型，下列说法正确的是。\nA. 副本类型目前分为全能副本和日志副本。\nB. 全能副本可读写，日志副本只读。\nC. Leader 副本可读写，全能副本的 Follower 只能读，日志副本不能读。\nD. 一个5副本集群，只要日志流3副本强同步，就可5副本强同步。", back: "答案：A。\n解析：在 OceanBase V4 架构中，副本类型被精简为主流的全能副本（包含日志和数据，可选举可读写）和日志副本（仅日志，可选举，不提供数据读取）。", type: "单选题" },
  { front: "[单选题] 12、关于 OceanBase V4 的负载均衡机制，下列说法正确的是。\nA. 用户指定其所在的 OBServer 节点位置。\nB. 用户可以通过表组（Tablegroup）来影响负载均衡...\nC. 自动负载均衡会将 Partition 均匀打散到 Zone 内所有 OBServer。\nD. 自动负载均衡会将 Leader 均匀打散到指定 Primary Zone。", back: "答案：B。\n解析：表组 (Tablegroup) 允许用户将经常做 Join 操作的表分区绑定在一起，确保它们在系统自动负载均衡时被调度到同一个节点，以减少跨节点网络开销。", type: "单选题" },
  { front: "[单选题] 6、OceanBase数据库通过什么机制来保证分布式事务在并发执行时不会读到不一致的数据？\nA. MVCC B. 两阶段提交 C. 锁机制 D. 全局时间戳", back: "答案：A。\n解析：OceanBase 使用多版本并发控制 (MVCC) 机制来保证并发事务读取到一致的快照数据，实现读写互不阻塞。全局时间戳提供一致的版本号。", type: "单选题" },
  { front: "[单选题] 7、以下哪项不是存储引擎需要完成的主要功能？\nA.数据存储 B. 数据读取 C. 数据分析 D. 数据合并", back: "答案：C。\n解析：数据分析（SQL 的复杂计算等）属于执行引擎和 SQL 引擎的范畴。存储引擎主要负责落盘物理存储、读取、转储(Minor Freeze)与合并(Major Freeze)。", type: "单选题" },
  { front: "[单选题] 8、OceanBase数据库中的多副本使用以下哪一种算法来确保分布式环境下的一致性？\nA. Raft B. Paxos C. Quorum D. Zab", back: "答案：B。\n解析：OceanBase 的高可用架构和多副本之间的数据强一致性是基于 Multi-Paxos 协议实现的。", type: "单选题" },
  { front: "[单选题] 9、在OceanBase数据库中，涉及多个分区的事务或者多个分区的写入，这种事务被称为什么类型的事务？\nA. 内部事务 B. 分布式事务 C. XA事务 D. 单元事务", back: "答案：B。\n解析：跨越多个分区的读写操作（由于分区可能分布在不同节点上），被称为分布式事务，由 OceanBase 内置的两阶段提交（2PC）协议保证原子性。", type: "单选题" },
  { front: "[单选题] 10.为了达到更好的压缩效果，OceanBase一般推荐进行几次压缩？\nA 1次 B 2次 C 3次 D 4次", back: "答案：B。\n解析：OceanBase 的 SSTable 通常采用两级压缩（如先进行字典编码/前缀压缩，再使用通用块压缩算法如 LZ4/Zstd），以达到极高的数据压缩比。", type: "单选题" },
  { front: "[单选题] 14、相比于集中式数据库，下列哪项是分布式数据库在事务处理上带来的挑战？\nA. 网络通信的不可靠 B. 节点故障的影响 C. 数据一致性的挑战 D. 性能下降", back: "答案：C。\n解析：虽然分布式系统面临诸多挑战，但在事务处理（ACID）层面，“数据一致性的挑战”（如跨节点分布式事务的原子性和隔离性）是最核心的技术难题。", type: "单选题" },
  
  // Batch 2 Single
  { front: "[单选题] 5、使用 JDBC连接Oracle租户时，需要使用哪个JDBC驱动？\nA、 MySQL标准JDBC驱动\nB、Oracle标准JDBC驱动\nC、OceanBase自己开发的JDBC驱动", back: "答案：C。\n解析：OceanBase 提供了针对其特性的 OceanBase JDBC 驱动（oceanbase-client），特别是连接 Oracle 模式租户时，必须使用该专用驱动。", type: "单选题" },
  { front: "[单选题] 6、关于慢查询优化，以下说法不正确的是：\nA、通过 GV$OB_SQL_AUDIT 自动定位慢查询\nB、GV$OB_SQL_AUDIT 的 elapsed_time...代表总耗时...\nC、通过 explain 查看实际执行计划", back: "答案：C。\n解析：EXPLAIN 命令生成的执行计划是优化器预估的逻辑执行计划（Estimated Plan），查看实际计划需依赖 trace 等诊断工具。", type: "单选题" },
  { front: "[单选题] 1、以下哪项不属于OceanBase数据库DBA日常工作内容？\nA. 数据库安装 B. 应用SQL改写 C. 数据库性能优化 D. 数据备份", back: "答案：B。\n解析：应用 SQL 的重构和改写主要是应用开发人员或业务架构师的职责；DBA 主要是进行安装部署、监控、性能调优和备份恢复。", type: "单选题" },
  { front: "[单选题] 3、ASH报告主要用于排查系统资源是否瓶颈，它依赖于？\nA.日志 B. OCP Agent C. 存储 D.活动会话历史视图", back: "答案：D。\n解析：ASH 即 Active Session History，它依赖于数据库内核提供的活动会话历史视图（如 GV$ACTIVE_SESSION_HISTORY）来生成报告。", type: "单选题" },
  { front: "[单选题] 4、OBServer全链路追踪数据存储在哪个日志文件？\nA.observer.log B. election.log C. trace.log D.rootservice.log", back: "答案：C (或 A)。\n解析：全链路追踪（Trace）的信息默认会输出打印到 trace.log 中。", type: "单选题" },
  { front: "[单选题] 1、OceanBase 产品体系中,哪一款是数据迁移的工具?\nA OMS\nB OMA\nC OAS\nD OCP", back: "答案：A。\n解析：OMS (OceanBase Migration Service) 是一站式数据迁移和同步平台，支持多种异构数据库向 OceanBase 迁移。", type: "单选题" },
  { front: "[单选题] 2、OceanBase的总控服务提供很多功能，但不包括？\nA 管理Paxos选举\nB 同步数据日志\nC 集群自动容灾调度\nD 租户资源管理", back: "答案：B。\n解析：RootService（总控服务）负责全局元数据管理、负载均衡等。数据日志的同步是由具体分区的 Paxos 组（全能副本）独立完成的。", type: "单选题" },
  { front: "[单选题] 3、OceanBase的RootService服务不包含以下哪项?\nA 容灾管理\nB 负载均衡\nC 数据加密\nD schema管理", back: "答案：C。\n解析：数据透明加密（TDE）是存储引擎层的机制，不属于 RootService 的管理职责。RootService 负责 schema管理、容灾和负载均衡。", type: "单选题" },
  { front: "[单选题] 4、在衡量数据库的高可用能力时,RPO指标指代什么?\nA 业务恢复时间\nB 数据同步延迟\nC 故障数据恢复率\nD 丢失数据量", back: "答案：D。\n解析：RPO 即恢复点目标，衡量灾难发生时允许丢失的最大数据量。OceanBase RPO=0。", type: "单选题" },
  { front: "[单选题] 5、0ceanBase的哪个周边产品能够提供数据库监控指标，以及全链路诊断?\nA OMS\nB ODP\nC OCP\nD 总控服务", back: "答案：C。\n解析：OCP 提供了全面的监控告警、性能诊断（如 SQL 审计、全链路追踪）以及自动化运维能力。", type: "单选题" },
  { front: "[单选题] 6、为了达到更好的压缩效果,OceanBase一般推荐进行几次压缩?\nA 1次\nB 2次\nC 3次\nD 4次", back: "答案：B。\n解析：通常采用两级压缩：第一级是底层的字典/差值编码等，第二级是针对数据块的通用压缩。", type: "单选题" },
  { front: "[单选题] 7、在OceanBase数据库中,数据的编码压缩主要发生在哪个阶段?\nA 内存写入阶段\nB 数据读取阶段\nC 数据合并阶段\nD 数据转储阶段", back: "答案：C。\n解析：在合并（Major Freeze）阶段，系统会将数据生成新的基线 SSTable，此时会进行最深度的编码和压缩以节省空间。", type: "单选题" },
  { front: "[单选题] 8、OceanBase数据库通过哪种方式实现了高并发的分布式执行?\nA 单线程处理\nB 硬件加速\nC 分布式执行引擎\nD 硬件网卡优化", back: "答案：C。\n解析：OceanBase 拥有强大的分布式 SQL 引擎和执行引擎，支持生成分布式执行计划（如并行查询 PQ）。", type: "单选题" },
  { front: "[单选题] 9、在OceanBase数据库中,哪个组件负责接收SQL语句并为SQL执行选择合适的执行计划?\nA ODP(OBProxy)\nB SQL引擎\nC 存储引擎\nD 总控服务", back: "答案：B。\n解析：SQL 引擎负责 SQL 的词法、语法解析、查询重写，并通过优化器生成执行计划。", type: "单选题" },
  { front: "[单选题] 10、OceanBase数据库的底层存储引擎主要是针对读多写少的场景优化设计的什么架构?\nA B-Tree\nB LSM-Tree\nC Hash\nD 堆文件组织", back: "答案：B。\n解析：OceanBase 的存储引擎基于 LSM-Tree 架构，将随机写转化为顺序写，提升写入性能并便于数据压缩。", type: "单选题" },
  { front: "[单选题] 11、OceanBase数据库执行计划缓存(Plan Cache)的主要作用是什么?\nA 提高DML插入数据的效率\nB 提高SELECT读取数据的效率\nC 让SQL解析器自动优化\nD 避免SQL硬解析,提高SQL执行效率", back: "答案：D。\n解析：Plan Cache 可以缓存 SQL 语句编译好的执行计划，下一次相同参数化 SQL 进来时（软解析），省去高昂的硬解析开销。", type: "单选题" },
  { front: "[单选题] 12、为了能自动化安装部署OceanBase数据库时,我们需要将不同类型的数据分别放在不同目录,以下哪个目录可以不单独划分?\nA /home\nB /root\nC /data/log1\nD /data/1", back: "答案：B。\n解析：/root 属于系统管理员目录，不需要也不建议单独划分为 OceanBase 的数据卷。", type: "单选题" },
  { front: "[单选题] 13、以下哪个工具可以用来自动化安装部署OceanBase集群?\nA OBD\nB OCP\nC OAT\nD ODC", back: "答案：A。\n解析：OBD (OceanBase Deployer) 是官方提供的用于自动化部署 OceanBase 集群的命令行工具。", type: "单选题" },
  
  // Batch 3 Single
  { front: "[单选题] 15、关于使用LOAD DATA命令，下列说法错误的是：\nA、客户端使用OBProxy连接数据库执行LOAD DATA命令,把OceanBase集群中一台OBServer节点上的csv文件导入到数据库中。\nB、使用LOAD DATA命令前,需要授予该文件给数据库的读取权限。\nC、LOAD DATA支持本地路径和远程路径两种方式。\nD、LOAD DATA使用本地路径时,需要指定direct 关键字的Hint", back: "答案：A。\n解析：LOAD DATA 默认是从“客户端”所在机器或者连接的节点读取文件。如果是通过 OBProxy 连入，无法确定最终连接的是哪台 OBServer，因此本地文件导入通常需要客户端直连目标 OBServer，或使用网络存储/OSS。", type: "单选题" },
  { front: "[单选题] 17、下列哪项日常运维操作不能通过OCP来执行?\nA、重启OBserver\nB、升级硬件\nC、替换OBserver\nD、升级集群", back: "答案：B。\n解析：OCP 是软件层面的自动化运维平台，支持重启、替换、升级软件，但物理硬件的升级（如插拔内存、更换CPU）无法通过 OCP 执行。", type: "单选题" },
  { front: "[单选题] 18、下列哪一项不属于OceanBase内核提供的监控诊断工具?\nA、OAS\nB、WR 和ASH\nC、SQL Trace\nD、系统内部视图", back: "答案：A。\n解析：WR、ASH、SQL Trace 和内部视图都属于数据库内核自身提供的诊断能力；OAS（OceanBase 自动调优服务）等属于周边生态平台。", type: "单选题" },
  { front: "[单选题] 22、假设一个5节点的OceanBase集群,最多允许几个节点故障而集群依然可用?\nA.1 B.2 C.3 D.4", back: "答案：B。\n解析：根据 Paxos 多数派协议，5 副本集群的多数派是 3，因此最多允许 5-3 = 2 个节点故障。", type: "单选题" },
  { front: "[单选题] 1、OceanBase 使用什么协议达成高可用和强一致性？\nA. 主从同步 + Paxos 协议\nB. 读写分离 + 高可用同步协议\nC. 日志同步 + 高可用同步协议\nD. 多副本 + Paxos 协议", back: "答案：D。\n解析：OceanBase 使用无共享的多副本架构，各副本之间通过 Multi-Paxos 分布式一致性协议进行日志同步，实现 RPO=0。", type: "单选题" },
  { front: "[单选题] 2、OceanBase 默认以什么为单位组建 Paxos 协议组？\nA. 租户\nB. 数据库\nC. 表\nD. 分区 (或日志流)", back: "答案：D。\n解析：在早期的架构中，OceanBase 以分区（Partition）为单位组建 Paxos 组；在 V4.0 及以后，是以日志流（Log Stream）为单位。", type: "单选题" },
  { front: "[单选题] 3、当应用向数据库写入事务时，默认会同步等待什么日志同步到多数派节点？\nA. Redo-Log 日志\nB. 系统日志\nC. Undo-log 日志\nD. 审计信息", back: "答案：A。\n解析：事务提交时，必须等待 Redo-Log （重做日志）通过 Paxos 协议同步到多数派节点并落盘后，才返回给应用提交成功。", type: "单选题" },
  { front: "[单选题] 4、OceanBase 内核采用的选举协议是？\nA. Paxos\nB. Raft\nC. Zookeeper\nD. ZAB", back: "答案：A。\n解析：OceanBase 实现了自主研发的基于 Multi-Paxos 算法的分布式强一致性协议。", type: "单选题" },
  { front: "[单选题] 5、管理员可以通过哪个命令创建资源池？\nA. create resource unit\nB. create resource pool\nC. create tenant\nD. create database", back: "答案：B。\n解析：创建资源池的 DDL 语句是 CREATE RESOURCE POOL。", type: "单选题" },
  { front: "[单选题] 6、OceanBase 不支持什么操作系统？\nA. CentOS\nB. Windows\nC. 统信操作\nD. 麒麟操作", back: "答案：B。\n解析：OceanBase 目前只能部署在 Linux 操作系统上，不支持 Windows。", type: "单选题" },
  { front: "[单选题] 7、OceanBase 一般用户的登录格式？\nA. 用户名@租户名，例如 root@sys\nB. 租户名@用户名，例如 sys@root\nC. 用户名@数据库名，例如 root@oceanbase\nD. 数据库名@用户名，例如 oceanbase@root", back: "答案：A。\n解析：OceanBase 为了区分不同租户的用户，直连（或通过直连端口）登录格式为 `用户名@租户名`。如果通过 OBProxy，通常是 `用户名@租户名#集群名`。", type: "单选题" },
  { front: "[单选题] 8、Linux 操作系统一般创建什么用户安装 OceanBase？\nA. root\nB. obuser\nC. observer\nD. admin", back: "答案：D。\n解析：在部署规范中，OceanBase 通常推荐使用 admin 用户进行安装部署，而非直接使用 root 用户。", type: "单选题" },
  { front: "[单选题] 9、ConfigServer(config url)主要是给以下哪个组件提供的？\nA. ODC\nB. OCP\nC. OMS\nD. OBProxy", back: "答案：D。\n解析：OBProxy 作为代理路由，需要知道集群的节点列表和状态。它可以通过访问 ConfigServer 动态获取集群的位置信息。", type: "单选题" },
  { front: "[单选题] 10、部署 OceanBase 集群时，各 OBServer 间 RPC 时钟同步时间偏移最多？\nA. 1 毫秒\nB. 10 毫秒\nC. 100 毫秒\nD. 200 毫秒", back: "答案：C。\n解析：OceanBase 强依赖时钟同步（NTP/Chrony）以生成全局时间戳。节点间时钟偏差过大（通常超过 100ms）会导致事务不可用或集群异常。", type: "单选题" },
  { front: "[单选题] 11、\"major_freeze_duty_time\" 设置为 \"02:00\" 意味着什么？\nA. 每天凌晨2点，自动触发一次转储操作\nB. 每天凌晨2点，自动触发一次合并操作\nC. 每天凌晨2点，自动触发一次内存清理操作\nD. 每天凌晨2点，自动触发一次数据恢复操作", back: "答案：B。\n解析：`major_freeze_duty_time` 参数用于设置系统每天自动触发全局大合并（Major Freeze）的时间。", type: "单选题" },
  { front: "[单选题] 12、通过哪个命令可以查询系统参数？\nA. show parameters like '%<pattern>%';\nB. alter system set <name>=<value>;\nC. show variables like '%<pattern>%';\nD. set @@global.<name>=<value>;", back: "答案：A。\n解析：在 OceanBase 中，`show parameters` 用于查看集群/租户级别的系统配置项（Parameters）；而 `show variables` 用于查看兼容 MySQL 模式的系统变量（Variables）。", type: "单选题" },
  { front: "[单选题] 13、OceanBase 是一个什么类型的数据库？\nA. 内存式数据库\nB. NoSQL 数据库\nC. 分布式关系型数据库\nD. 图数据库", back: "答案：C。\n解析：OceanBase 是一款原生的企业级分布式关系型数据库（RDBMS），兼具 NoSQL 的高扩展性和关系型数据库的强一致性。", type: "单选题" },

  // ---------------- 多选题 ----------------
  { front: "[多选题] 11、在OceanBase数据库中，关于转储和合并的说法，下面哪些是正确的？\nA. 转储是将MemTable中的数据写到SSTable中的过程。\nB. 合并是将多个SSTable以及当前数据进行归并，形成新的基线SSTable的过程。\nC. 转储不仅可以手动触发，也可以由系统自动触发。\nD. 合并过程可以节省磁盘空间的使用，因为会删除失效的旧版本数据。", back: "答案：A、B、C、D。\n解析：转储（Minor Freeze）是将内存数据落盘；合并（Major Freeze）是全局数据归并。两者均可自动或手动触发，合并会清理多版本旧数据释放空间。", type: "多选题" },
  { front: "[多选题] 12.在OceanBase数据库支持的隔离级别中，包含哪些？\nA. 读未提交 B. 串行化 C. 重复读 D. 读已提交", back: "答案：B、D。\n解析：OceanBase 商业版主要支持“读已提交（Read Committed，默认级别）”和“可串行化（Serializable）”。", type: "多选题" },
  { front: "[多选题] 13、OceanBase数据库的事务具备哪些特性？\nA. 原子性 B. 一致性 C. 隔离性 D. 持久性", back: "答案：A、B、C、D。\n解析：OceanBase 作为成熟的关系型数据库，完全符合事务的传统 ACID 四大特性。", type: "多选题" },
  { front: "[多选题] 15、OceanBase数据库通过哪些机制来保证多个事务的并发执行？\nA. 一致性算法 B. MVCC C. 隔离级别 D. 锁", back: "答案：B、C、D。\n解析：并发控制（避免读写冲突、写写冲突）主要依赖多版本并发控制 (MVCC)、隔离级别配置以及行锁机制。一致性算法（Paxos）主要用于保证多副本数据高可用。", type: "多选题" },
  { front: "[多选题] 7、OceanBase数据库支持的分区类型包含以下哪些？\nA、Range分区 B、List分区 C、Hash分区 D、Key分区", back: "答案：A、B、C (以及 D)。\n解析：OceanBase 支持主流的关系型数据库分区策略，包括 Range（范围）、List（列表）、Hash（哈希）以及 Key 等一级分区和各种二级分区组合。", type: "多选题" },
  { front: "[多选题] 8、关于表组（Tablegroup）说法正确的是：\nA、将经常一起关联查询的表放入同一个表组，可以减少分布式事务。\nB、分区表可以放入表组中，要求所有表的分区方式一致。\nC、非分区表也可以放入表组中。\nD、表组不能跨租户存在。", back: "答案：A、B、C、D。\n解析：表组是用于控制物理数据分布的逻辑概念。属于同表组的表或分区会被调度到同一个 OBServer 上，从而将分布式 JOIN 转换为本地 JOIN。", type: "多选题" },
  { front: "[多选题] 9、OceanBase数据库提供的导数工具包含：\nA、OBLOADER\nB、ODC\nC、LOAD DATA\nD、OBDUMPER", back: "答案：A、B、D。\n解析：OBLOADER 和 OBDUMPER 是专用的客户端导数/备份导出命令行工具；ODC 提供了图形化的导入导出功能；LOAD DATA 则是 SQL 语句，并非独立工具。", type: "多选题" },
  { front: "[多选题] 2、以下哪项不属于OceanBase数据库内核暴露的管理接口？\nA. OCP 管理控制台\nB. 内部系统表（如 __all_xxx）\nC. 内部系统视图（如 GV$xxx）\nD. 各种 DDL 管理命令", back: "答案：A。\n解析：OCP 属于外部生态工具层，并不属于“内核暴露”的接口；内核暴露的接口是指系统内部表、系统视图以及支持管理的 SQL 语句。", type: "多选题" },
  { front: "[多选题] 5、通过OCP对于OceanBase数据库SQL诊断可以完成以下哪些操作？\nA. SQL改写\nB. 查看SQL执行计划\nC. SQL性能分析\nD. SQL执行结果查看", back: "答案：B、C。\n解析：OCP 的 SQL 诊断主要用于排查慢 SQL、查看统计信息、执行耗时和历史执行计划等。SQL 的执行结果查看和主动改写通常是在 ODC 等开发工具中完成。", type: "多选题" },
  { front: "[多选题] 6、通过OCP管理OceanBase数据库集群扩容，包括以下哪些操作？\nA. 增加Zone\nB. 增加OBServer\nC. 增加CPU硬件\nD. 修改Zone", back: "答案：A、B。\n解析：OCP 扩容集群主要是逻辑和软件层面的横向扩展，例如往集群中新增 Zone，或在现有 Zone 中添加更多的 OBServer 节点。增加硬件不由 OCP 管理。", type: "多选题" },
  { front: "[多选题] 7、通过OCP管理租户资源扩容，包括以下哪些操作？\nA. 调大Unit的CPU/Memory配置\nB. 增加Zone\nC. 增加OBServer\nD. 增加租户的Unit数量 (Unit Num)", back: "答案：A、D。\n解析：租户扩容分纵向和横向：纵向是调大单个 Unit 的规格（Resource Unit），横向是增加 Unit 的数量（Unit Num）以利用更多节点资源。", type: "多选题" },
  { front: "[多选题] 8、OCP Agent包含以下哪些核心进程？\nA. ocp_agentd\nB. ocp_mgragent\nC. ocp_proxy\nD. ocp_monagent", back: "答案：A、D。\n解析：早期版本的 OCP Agent 主要包含负责监控数据采集的 monagent 和负责远程任务执行的 mgragent；后续演进中常统一为 ocp_agentd 等核心守护进程。", type: "多选题" },
  { front: "[多选题] 9、通过OCP可对主机进行哪些操作？\nA. 安装OCP Agent\nB. 重启主机服务\nC. 停止主机服务\nD. 删除主机", back: "答案：A、B、C、D。\n解析：OCP 具有主机管理能力，支持将物理机加入资源池，在上面安装 Agent，并在不需要时停用或移除主机。", type: "多选题" },
  { front: "[多选题] 10、通过OCP可对租户进行哪些操作？\nA. 创建新租户\nB. 租户资源扩缩容\nC. 删除租户\nD. 查看租户监控拓扑", back: "答案：A、B、C、D。\n解析：OCP 是白屏化运维的核心，租户的全生命周期管理（创建、删除、监控、扩容、参数修改）均可在其上完成。", type: "多选题" },
  { front: "[多选题] 14、系统内置视图oceanbase.gv$OB_SQL_AUDIT包含以下哪些信息?\nA.SQL类型及执行次数\nB.SQL的执行计划\nC.等待的时间及次数\nD.执行统计信息", back: "答案：A、C、D。\n解析：gv$OB_SQL_AUDIT 记录了 SQL 审计信息，但不包含具体的逻辑/物理执行计划（需通过 explain 或 plan cache 视图查看）。", type: "多选题" },
  { front: "[多选题] 16、关于SHARDING模式为PARTITION和TABLEGROUP,下列说法正确的是：\nA、要求表组内所有表的分区方式必须相同\nB、要求表组内所有表的分区数量必须相同\nC、表组内所有表的分区会聚集在相同的OBserver节点上\nD、如果不将表放在一个表组里，即使全都是单表查询,也是一个跨机事务", back: "答案：A、C。\n解析：加入 Tablegroup 的表必须有相同的分区策略（包括分区类型、分区数等），系统会将对应分区调度到相同节点以实现本地关联（Local Join）。", type: "多选题" },
  { front: "[多选题] 19、以下哪些是 OceanBase 的架构特性?\nA 原生分布式架构\nB 存储分布式一体化\nC 支持多租户架构\nD 能很好聚成 OLAP 和 OLTP 执行引擎", back: "答案：A、B、C、D。\n解析：OceanBase 是原生分布式架构，支持多租户隔离，且是 HTAP 数据库，能同时处理 OLTP 和 OLAP 负载。", type: "多选题" },
  { front: "[多选题] 20、以下哪些是OceanBase分布式数据库的优势?\nA 数据不丢失\nB 自动故障恢复\nC 高性价比\nD 支持超大规模业务集群", back: "答案：A、B、C、D。\n解析：基于 Paxos 的 RPO=0 数据不丢失和 RTO秒级恢复；通过极高压缩比和普通PC服务器带来高性价比；原生分布式架构支持超大规模集群扩展。", type: "多选题" },
  { front: "[多选题] 21、在OceanBase V4 版本,租户的类型包含哪些?\nA 临时租户\nB 用户租户\nC Meta租户\nD 系统租户", back: "答案：B、C、D。\n解析：V4 版本中，每个用户租户会自动配套一个 Meta 租户存放自身元数据，加上系统租户，主要为这三大类。", type: "多选题" },
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
  { front: "[多选题] 14、以下哪些是RootService的作用？\nA 资源管理\nB 负载均衡\nC 路由\nD 总控服务", back: "答案：A、B、D。\n解析：RootService 是集群的“总控”，负责租户资源分配、系统 Schema 管理、节点心跳与负载均衡调度。但客户端 SQL 的路由是由 OBProxy 负责的。", type: "多选题" },

  // ---------------- 判断题 ----------------
  { front: "[判断题] 2、OceanBase 是全球唯一一个同时刷新了 TPCC 和 TPCH 测试纪录的数据库。", back: "答案：正确。\n解析：OceanBase 在 2019 年和 2020 年打破 TPC-C 纪录，并在 2021 年打破 TPC-H 纪录，是唯一同时登顶这两大权威测试榜单的分布式数据库。", type: "判断题" },
  { front: "[判断题] 3、OceanBase 是原生分布式数据库，和传统单机数据库有着本质上的区别。", back: "答案：正确。\n解析：OceanBase 采用 Shared-Nothing 架构，具有内生的分布式高可用和水平扩展能力，区别于传统单机数据库+中间件方案。", type: "判断题" },
  { front: "[判断题] 4、OceanBase 是一个通用数据库，不依赖特定硬件架构，任何公有云、私有云环境，甚至混合云都能部署。", back: "答案：正确。\n解析：OceanBase 是纯软件实现的分布式数据库，运行在普通 PC 服务器上，支持多云、混合云部署。", type: "判断题" },
  { front: "[判断题] 5、OceanBase 是一个关系型数据库，非常好地处理高并发的事务，但是不能处理复杂的报表分析业务，不是 HTAP 数据库。", back: "答案：错误。\n解析：OceanBase 是一款典型的 HTAP 数据库，使用同一套引擎和数据同时支持高并发的 OLTP 业务和复杂的 OLAP 报表分析业务。", type: "判断题" },
  { front: "[判断题] 1、Zone 是一个逻辑概念，一个 Zone 内的所有 OBServer 拥有相同的配置和相同数量的资源。", back: "答案：错误。\n解析：Zone 是逻辑划分，一个 Zone 内的 OBServer 配置和资源不需要完全相同，集群支持在异构机型上运行。", type: "判断题" },
  { front: "[判断题] 2、一个 Zone 会自动对应同城的一个机房，不同的 Zone 会自动对应不同城市的机房。", back: "答案：错误。\n解析：Zone 是逻辑概念，映射灵活。多个 Zone 可以部署在同城不同机房（同城三中心），不强制自动对应不同城市。", type: "判断题" },
  { front: "[判断题] 3、OceanBase V4 以分区为单位，提供数据管理和多副本间的日志同步。", back: "答案：错误。\n解析：OceanBase V4.0 引入了“日志流 (Log Stream)”，不再以单个分区为单位，而是以日志流为单位进行多副本日志同步，降低了系统开销。", type: "判断题" },
  { front: "[判断题] 1、OceanBase数据库支持在一个系统中同时存在MySQL模式和Oracle模式的租户。", back: "答案：正确。\n解析：多租户架构允许在一个集群内创建多个租户，且不同租户可分别设置为 MySQL 兼容模式或 Oracle 兼容模式，互不影响。", type: "判断题" },
  { front: "[判断题] 1、OceanBase 数据库提供企业级高可用能力，并且在处于任何状态下，其集群只能进行全同步复制模式运行。", back: "答案：错误。\n解析：OceanBase 采用 Multi-Paxos 协议，只需多数派（Majority）节点同步成功即可提交事务，不需要全同步。此外也可以配置主备库进行异步同步。", type: "判断题" },
  { front: "[判断题] 11、WR和ASH报告分析资源瓶颈是一个离线的，不需要在问题发生时实时抓取视图数据。", back: "答案：正确。\n解析：ASH (Active Session History) 和 WR 会在后台定期将系统运行状态和会话数据采样并持久化，因此支持事后离线分析问题。", type: "判断题" },
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
  { front: "[判断题] 47、OceanBase全链路追踪的结果只能通过OCP查看,不支持函数(或命令行)查看。", back: "答案：错误。\n解析：全链路追踪的结果除了可以在 OCP 界面上可视化查看外，也直接打印在 trace.log 等日志文件中，可以命令行或 SQL 形式查看。", type: "判断题" }
];

const publicDir = path.join(__dirname, 'public');

function writeCSV(filename, typeFilter) {
    const data = allData.filter(item => item.type === typeFilter);
    const csv = Papa.unparse(data, { quotes: true });
    fs.writeFileSync(path.join(publicDir, filename), csv, 'utf-8');
}

writeCSV('单选题.csv', '单选题');
writeCSV('多选题.csv', '多选题');
writeCSV('判断题.csv', '判断题');

console.log('All files generated successfully.');
