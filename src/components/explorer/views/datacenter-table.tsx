"use client";

import { DataTable } from "@/components/explorer/data-table";
import { dataCenterColumns } from "@/components/explorer/columns/datacenter-columns";
import type { SimpleDatacenter } from "@/lib/type";
import { getAllDC, deleteDC } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);

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

  const handleDeleteDataCenter = (id: string) => {
    setLoading(true);
    deleteDC(id)
      .then((success) => {
        if (success) {
          // 如果删除成功，更新本地状态
          const updatedDCs = dataCenters.filter((dc) => dc.id !== id);
          setDataCenters(updatedDCs);
          // 重新计算总计数据
          calculateTotalCounts(updatedDCs);
        } else {
          console.error("Failed to delete datacenter");
          // 可能需要显示错误消息给用户
        }
      })
      .catch((error) => {
        console.error("Error deleting datacenter:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteMultiple = (rows: Row<SimpleDatacenter>[]) => {
    const idsToDelete = rows.map((row) => row.original.id);
    setLoading(true);

    // 创建所有删除操作的Promise数组
    const deletePromises = idsToDelete.map((id) => deleteDC(id));

    // 执行所有删除操作
    Promise.all(deletePromises)
      .then((results) => {
        // 检查是否所有删除操作都成功
        const allSuccessful = results.every((success) => success);

        if (allSuccessful) {
          // 如果所有删除都成功，更新本地状态
          const updatedDCs = dataCenters.filter((dc) => !idsToDelete.includes(dc.id));
          setDataCenters(updatedDCs);
          // 重新计算总计数据
          calculateTotalCounts(updatedDCs);
        } else {
          // 如果有删除失败，重新加载数据以确保一致性
          loadDataCenters();
        }
      })
      .catch((error) => {
        console.error("Error deleting multiple datacenters:", error);
        // 发生错误时重新加载数据
        loadDataCenters();
      })
      .finally(() => {
        setLoading(false);
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
      // loadDataCenters();
    }

    // 无论更新是否成功，都关闭编辑对话框
    setEditDialogOpen(false);
  };

  // 添加手动刷新功能
  const handleRefresh = () => {
    loadDataCenters();
  };

  const columns = dataCenterColumns(onSelect);

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
        onDeleteRow={handleDeleteDataCenter}
        onEditRow={handleEditDataCenter}
        getRowId={(row) => row.id}
        loading={loading}
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
