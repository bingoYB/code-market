import dayjs from "dayjs";
import { Connection } from "jsstore";

export class HistoryReecordDB {
  dbConnection: any;
    fail: boolean;
    ONEDAY: number;
    MAX: number;
    initPromise: Promise<void>;
  constructor({ tables, userId, env }) {
    const initMeta = async () => {
      try {
        this.dbConnection = new Connection();
        const dbName = userId + env + "_history_db";
        const database = {
          name: dbName,
          tables,
        };

        await this.dbConnection.initDb(database);
      } catch (error) {
        console.error(error);
        this.fail = true;
      }
    };

    if (typeof window === "undefined") {
      return;
    } else {
      this.MAX = 30;
      this.ONEDAY = 24 * 3600 * 1000;

      this.initPromise = initMeta();
    }
  }

  async add({ type, record, id }) {
    await this.initPromise;

    if (this.fail) return;

    const record_date = dayjs().format("YYYY-MM-DD");

    await this.dbConnection.remove({
      from: type,
      where: {
        date_width_id: [id, record_date],
      },
    });

    await this.delOverflow(type);

    await this.dbConnection.insert({
      into: type,
      values: [{ ...record, record_time: Date.now(), id, record_date }],
    });
  }

  async del({ type, id, record_date }) {
    await this.dbConnection.remove({
      from: type,
      where: {
        id,
        record_date,
      },
    });
  }

  // 删除超过30天的记录
  async delOverflow(type) {
    const minTime = dayjs(
      dayjs().subtract(this.MAX, "day").format("YYYY-MM-DD")
    ).valueOf();
    await this.dbConnection.remove({
      from: type,
      where: {
        record_time: {
          "<": minTime,
        },
      },
    });
  }

  /**
   * 清空
   */
  async delAll(type) {
    await this.initPromise;
    this.dbConnection.clear(type);
  }

  async getList({ type, lastRecord, limit }) {
    await this.initPromise;
    const result = await this.dbConnection.select({
      from: type,
      where: {
        record_time: {
          "<": lastRecord?.record_time || Date.now(),
        },
      },
      limit,
    });

    return result;
  }
}

/**
 * @type {import("jsstore").TColumns}}
 */
const commonColumns = {
  id: { notNull: true, dataType: "number" },
  record_date: { notNull: true, dataType: "string" },
  record_time: { notNull: true, dataType: "number" },
  date_width_id: { keyPath: ["id", "record_date"], primaryKey: true },
};
/**
 * @type {import("jsstore").TColumns}}
 */
const HistoryTables = [
  {
    name: "pin",
    columns: {
      file: { notNull: true, dataType: "object" },
      ...commonColumns,
    },
  },
  {
    name: "test",
    columns: {
      record: { notNull: true, dataType: "object" },
      ...commonColumns,
    },
  },
];
