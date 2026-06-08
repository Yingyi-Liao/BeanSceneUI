import axios from "axios";
import { API_BASE } from "../constants/apibase";

export async function fetchReportOrders(jwt) {
  const res = await axios.get(`${API_BASE}/api/order`);

  const raw = res.data.data;

  const normalized = raw.map((o) => ({
    ...o,
    createdAt: new Date(o.createdAt.seconds * 1000),
    updatedAt: o.updatedAt
      ? new Date(o.updatedAt.seconds * 1000)
      : null,
    table: o.tableNumber,
  }));

  return normalized;
}
