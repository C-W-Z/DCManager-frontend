"use client";

import { DataTable } from "@/components/explorer/data-table";
import { dataCenterColumns } from "@/components/explorer/columns/datacenter-columns";
import type { SimpleDatacenter } from "@/lib/type";
import { getAllDC, deleteDC } from "@/lib/api";
import { useEffect, useState } from "react";
import { AddDatacenterDialog } from "@/components/explorer/dialogs/add-datacenter-dialog";
import type { Row } from "@tanstack/react-table";
import {
  type Count,
  DataCenterSummary,
} from "@/components/explorer/summary/datacenter-summary";
import { EditDatacenterDialog } from "@/components/explorer/dialogs/edit-datacenter";

interface DataCenterTableProps {
  onSelect: (dc: SimpleDatacenter) => void;
}

export default function DataCenterTable({ onSelect }: DataCenterTableProps) {
  const [dataCenters, setDataCenters] = useState<SimpleDatacenter[]>([]);
  const [totalCounts, setTotalCounts] = useState<Count>({ dc: 0, room: 0, rack: 0, host: 0 });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentDC, setCurrentDC] = useState<SimpleDatacenter | null>(null);

  // 加载数据中心列表和计算总计数据
  const loadDataCenters = () => {
    getAllDC()
      .then((dcs) => {
        setDataCenters(dcs);
        calculateTotalCounts(dcs);
      })
      .catch((error) => {
        console.error("Error fetching all dc data:", error);
        setDataCenters([]);
      });
  };

  // 计算总计数据
  const calculateTotalCounts = (dcs: SimpleDatacenter[]) => {
    let n_rooms = 0;
    let n_racks = 0;
    let n_hosts = 0;
    dcs.forEach((dc: SimpleDatacenter) => {
      n_rooms += dc.n_rooms;
      n_racks += dc.n_racks;
      n_hosts += dc.n_hosts;
    });
    setTotalCounts({
      dc: dcs.length,
      room: n_rooms,
      rack: n_racks,
      host: n_hosts,
    });
  };

  useEffect(() => {
    loadDataCenters();
  }, []);

  const handleDeleteDataCenter = (id: string) => {
    deleteDC(id)
      .then(() => {
        // 更新本地状态
        const updatedDCs = dataCenters.filter((dc) => dc.id !== id);
        setDataCenters(updatedDCs);
        // 重新计算总计数据
        calculateTotalCounts(updatedDCs);
      })
      .catch((error) => {
        console.error("Error deleting datacenter:", error);
      });
  };

  const handleDeleteMultiple = (rows: Row<SimpleDatacenter>[]) => {
    const idsToDelete = rows.map((row) => row.original.id);

    // 创建所有删除操作的Promise数组
    const deletePromises = idsToDelete.map((id) => deleteDC(id));

    // 执行所有删除操作
    Promise.all(deletePromises)
      .then(() => {
        // 更新本地状态
        const updatedDCs = dataCenters.filter((dc) => !idsToDelete.includes(dc.id));
        setDataCenters(updatedDCs);
        // 重新计算总计数据
        calculateTotalCounts(updatedDCs);
      })
      .catch((error) => {
        console.error("Error deleting multiple datacenters:", error);
      });
  };

  const handleEditDataCenter = (dc: SimpleDatacenter) => {
    setCurrentDC(dc);
    setEditDialogOpen(true);
  };

  const handleUpdateDataCenter = (updatedDC: SimpleDatacenter | null) => {
    if (updatedDC) {
      // 如果更新成功，更新本地状态中的数据中心
      setDataCenters((prev) => prev.map((dc) => (dc.id === updatedDC.id ? updatedDC : dc)));

      // 由于我们只有部分更新的数据中心信息，可能需要重新加载完整列表
      // 或者，如果更新不影响总计数据，可以跳过重新加载
      // 这里选择重新加载以确保数据一致性
      loadDataCenters();
    }

    // 无论更新是否成功，都关闭编辑对话框
    setEditDialogOpen(false);
  };

  const columns = dataCenterColumns(onSelect);

  return (
    <div>
      <DataCenterSummary totalCount={totalCounts} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Centers</h1>
        <AddDatacenterDialog />
      </div>

      <DataTable
        columns={columns}
        data={dataCenters}
        onDeleteRows={handleDeleteMultiple}
        onDeleteRow={handleDeleteDataCenter}
        onEditRow={handleEditDataCenter}
        getRowId={(row) => row.id}
      />

      {currentDC && (
        <EditDatacenterDialog
          datacenter={currentDC}
          onUpdate={handleUpdateDataCenter}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
}
