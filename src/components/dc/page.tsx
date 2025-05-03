import { columns } from "./columns";
import { DataTable } from "./data-table";
import data from "./mock.json";

// import { DCInfo } from "./columns";
// const data: DCInfo[] = [
//   {
//     id: "728ed52f",
//     name: "TapeiA",
//     default_height: 42,
//     rooms: [],
//     n_rooms: 12,
//     n_racks: 123,
//     n_hosts: 456,
//   },
//   {
//     id: "adsdj453",
//     name: "TapeiB",
//     default_height: 38,
//     rooms: [],
//     n_rooms: 23,
//     n_racks: 124,
//     n_hosts: 654,
//   },
// ];

export default function DemoPage() {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
