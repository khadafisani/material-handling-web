export interface Item {
  id: string;
  title: string;
  date: string;
  status_name: "Requested" | "On Progress" | "Fulfilled" | "Rejected" | "Unknown";
}
