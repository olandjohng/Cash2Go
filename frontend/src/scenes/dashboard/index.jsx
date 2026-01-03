import {
  Box,
  Grid,
  styled,
  TextField,
  MenuItem,
  Typography,
  Skeleton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Card from "./component/Card";
import { useEffect, useState } from "react";
import { toastErr, formatNumber } from "../../utils";
import LinearProgress from "@mui/material/LinearProgress";
import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

const StlyedDataGrid = styled(DataGrid)({
  "& .status--4": {
    backgroundColor: "#78350f",
    "&:hover": {
      backgroundColor: "#92400e",
    },
  },
  "& .status--1": {
    backgroundColor: "#14532d",
    "&:hover": {
      backgroundColor: "#15803d",
    },
  },
});

const options = [
  { value: "month", label: "month" },
  { value: "year", label: "year" },
];

const fetcher = (url) => fetch(url).then((r) => r.json());

const Dashboard = () => {
  const { data: weeklyCollectionData, isLoading: weeklyCollectionLoading } =
    useSWR("/api/loans/collections/week", fetcher);
  const { data: monthlyCollectionData, isLoading: monthlyCollectionLoading } =
    useSWR("/api/loans/collections/month", fetcher);
  const { data: yearlyCollectionData, isLoading: yearlyCollectionLoading } =
    useSWR("/api/loans/collections/year", fetcher);
  const { data: incomeData, isLoading: incomeLoading } = useSWR(
    "/api/loans/collections/income",
    fetcher
  );
  const { data: birthdayData, isLoading: birthdayLoading } = useSWR(
    "/api/customers/birthday",
    fetcher
  );

  const columns = [
    { field: "due_date", headerName: "Due Date", width: 100 },
    { field: "pn_number", headerName: "PN Number", width: 200 },
    { field: "full_name", headerName: "Borrower Number", width: 200 },
    { field: "monthly_principal", headerName: "Principal", width: 150 },
    { field: "monthly_interest", headerName: "Interset", width: 150 },
    { field: "pr_number", headerName: "PR Number", width: 150 },
  ];

  const birthday_column = [
    { field: "full_name", headerName: "Name", width: 250 },
    { field: "label", headerName: "Desc", width: 200 },
    { field: "phone_number", headerName: "Contact Number", width: 200 },
    { field: "date", headerName: "Date", width: 150 },
  ];

  const [type, setType] = useState(options[0].value);

  return (
    <Box
      height="100%"
      overflow="auto"
      padding={3}
      sx={{ backgroundColor: "background.default" }}
    >
      {/* Income Cards Section with Animation */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(240px, 1fr))"
        gap={3}
        mb={4}
      >
        {incomeLoading ? (
          <>
            <Skeleton
              variant="rectangular"
              height={140}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={140}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={140}
              sx={{ borderRadius: 2 }}
            />
          </>
        ) : (
          <>
            <Card
              title="Daily Income"
              content={formatNumber.format(incomeData?.data?.daily || 0)}
              icon="daily"
            />
            <Card
              title="Weekly Income"
              content={formatNumber.format(incomeData?.data?.weekly || 0)}
              icon="weekly"
            />
            <Card
              title="Monthly Income"
              content={formatNumber.format(incomeData?.data?.monthly || 0)}
              icon="monthly"
            />
          </>
        )}
      </Box>
      <Box>
        {/* Weekly Collection Section */}
        <Box
          sx={{
            height: "28rem",
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            overflow: "hidden",
            mb: 3,
          }}
          display="flex"
          flexDirection="column"
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: "2px solid",
              borderColor: "divider",
              background:
                "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: "0.5px",
                color: "text.primary",
              }}
            >
              📅 Weekly Collection
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Current week's due payments
            </Typography>
          </Box>
          {weeklyCollectionLoading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton
                variant="rectangular"
                height="100%"
                sx={{ borderRadius: 1 }}
              />
            </Box>
          ) : (
            <Box flex={1} position="relative">
              <Box sx={{ position: "absolute", inset: 0 }}>
                <StlyedDataGrid
                  loading={weeklyCollectionLoading}
                  rows={weeklyCollectionData?.data || []}
                  columns={columns}
                  getRowId={(r) => r.loan_detail_id}
                  getRowClassName={(params) =>
                    `status--${params.row.payment_status_id}`
                  }
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Monthly/Yearly Collection Section */}
        <Box
          sx={{
            height: "28rem",
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            overflow: "hidden",
            mb: 3,
          }}
          display="flex"
          flexDirection="column"
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid",
              borderColor: "divider",
              background:
                "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  color: "text.primary",
                }}
              >
                📊 {type === "month" ? "Monthly" : "Yearly"} Collections
              </Typography>
              <Typography variant="caption" color="text.secondary">
                View collections by time period
              </Typography>
            </Box>
            <TextField
              select
              size="small"
              value={type}
              onChange={(e) => setType(e.target.value)}
              sx={{
                minWidth: 120,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontWeight: 600,
                },
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box position="relative" flex={1}>
            <Box sx={{ position: "absolute", inset: 0 }}>
              {type === "month" ? (
                <MonthlyCollectionsDataGrid
                  columns={columns}
                  isLoading={monthlyCollectionLoading}
                  monthlyCollection={monthlyCollectionData}
                />
              ) : (
                <YearlyCollectionsDataGrid
                  columns={columns}
                  isLoading={yearlyCollectionLoading}
                  yearlyCollection={yearlyCollectionData}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Birthday Section */}
        <Box
          sx={{
            height: "28rem",
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
          display="flex"
          flexDirection="column"
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: "2px solid",
              borderColor: "divider",
              background:
                "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: "0.5px",
                color: "text.primary",
              }}
            >
              🎂 Upcoming Birthdays
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Celebrate with your customers
            </Typography>
          </Box>
          <Box flex={1} position="relative">
            <Box sx={{ position: "absolute", inset: 0 }}>
              <BirthdayDataGrid
                columns={birthday_column}
                birthdayData={birthdayData}
                isLoading={birthdayLoading}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

function MonthlyCollectionsDataGrid({ columns, monthlyCollection, isLoading }) {
  return isLoading ? (
    <Skeleton variant="rectangular" height="100%" />
  ) : (
    <StlyedDataGrid
      columns={columns}
      rows={monthlyCollection?.data || []}
      getRowId={(r) => r.loan_detail_id}
      getRowClassName={(params) => `status--${params.row.payment_status_id}`}
    />
  );
}

function YearlyCollectionsDataGrid({ columns, yearlyCollection, isLoading }) {
  return isLoading ? (
    <Skeleton variant="rectangular" height="100%" />
  ) : (
    <StlyedDataGrid
      columns={columns}
      rows={yearlyCollection?.data || []}
      getRowId={(r) => r.loan_detail_id}
      getRowClassName={(params) => `status--${params.row.payment_status_id}`}
    />
  );
}

function BirthdayDataGrid({ columns, birthdayData, isLoading }) {
  return isLoading ? (
    <Skeleton variant="rectangular" height="100%" />
  ) : (
    <StlyedDataGrid columns={columns} rows={birthdayData?.data || []} />
  );
}

export default Dashboard;
