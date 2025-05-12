"use client";

import { DataTable } from "@/components/explorer/data-table";
import { dataCenterColumns } from "@/components/explorer/columns/datacenter-columns";
import type { SimpleDatacenter } from "@/lib/type";
import { getAllDC } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { AddDatacenterDialog } from "@/components/explorer/dialogs/add-datacenter-dialog";
import type { Row } from "@tanstack/react-table";
import {
  type Count,
  DataCenterSummary,
} from "@/components/explorer/summary/datacenter-summary";
import { DeleteConfirmation } from "../dialogs/delete-confirm";

interface DataCenterTableProps {
  onSelect: (dc: SimpleDatacenter) => void;
}

export default function DataCenterTable({ onSelect }: DataCenterTableProps) {
  const [dataCenters, setDataCenters] = useState<SimpleDatacenter[]>([]);
  const [totalCounts, setTotalCounts] = useState<Count>({ dc: 0, room: 0, rack: 0, host: 0 });
  const [loading, setLoading] = useState(false);
  const [multipleIdsToDelete, setMultipleIdsToDelete] = useState<string[]>([]);

  // 使用 useCallback 包装 calculateTotalCounts 函数
  const calculateTotalCounts = useCallback((dcs: SimpleDatacenter[]) => {
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
  }, []);

  // 使用 useCallback 包装 loadDataCenters 函数
  const loadDataCenters = useCallback(() => {
    setLoading(true);
    getAllDC()
      .then((dcs) => {
        setDataCenters(dcs);
        calculateTotalCounts(dcs);
      })
      .catch((error) => {
        console.error("Error fetching all dc data:", error);
        setDataCenters([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [calculateTotalCounts]);

  useEffect(() => {
    loadDataCenters();
  }, [loadDataCenters]); // 正确添加依赖项

  const handleUpdateDataCenter = (updatedDC: SimpleDatacenter | null) => {
    if (updatedDC) {
      // 如果更新成功，更新本地状态中的数据中心
      setDataCenters((prev) => prev.map((dc) => (dc.id === updatedDC.id ? updatedDC : dc)));
      // 重新加载数据以确保一致性
      // loadDataCenters();
    }
  };

  const handleDeleteMultiple = (rows: Row<SimpleDatacenter>[]) => {
    const idsToDelete = rows.map((row) => row.original.id);
    setMultipleIdsToDelete(idsToDelete);
  };

  const handleMultipleDeleteSuccess = (idsToDelete: string[]) => {
    setMultipleIdsToDelete([]);
    // 重新加载数据
    // loadDataCenters();

    const updatedDCs = dataCenters.filter((dc) => !idsToDelete.includes(dc.id));
    setDataCenters(updatedDCs);
    // 重新计算总计数据
    calculateTotalCounts(updatedDCs);
  };

  // 添加手动刷新功能
  const handleRefresh = () => {
    loadDataCenters();
  };

  const columns = dataCenterColumns(onSelect, handleUpdateDataCenter, handleMultipleDeleteSuccess);

  return (
    <div>
      <DataCenterSummary totalCount={totalCounts} />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Centers</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <AddDatacenterDialog />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={dataCenters}
        onDeleteRows={handleDeleteMultiple}
        getRowId={(row) => row.id}
        loading={loading}
      />

      {/* 多选删除确认对话框 */}
      <DeleteConfirmation
        ids={multipleIdsToDelete}
        type="datacenter"
        onSuccess={handleMultipleDeleteSuccess}
      />
    </div>
  );
}
