export interface ExportData {
  groups: any[];
  members: any[];
  loans: any[];
  timestamp: string;
}

export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadJSON = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadExcel = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  
  let htmlContent = `
    <table border="1" cellpadding="10" cellspacing="0">
      <thead>
        <tr style="background-color: #4CAF50; color: white;">
          ${headers.map((h) => `<th>${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (row) => `
          <tr>
            ${headers.map((h) => `<td>${row[h]}</td>`).join("")}
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.xls`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateGroupReport = (
  groups: any[],
  members: any[],
  loans: any[]
): any[] => {
  return groups.map((group) => {
    const groupMembers = members.filter((m: any) => m.groupId === group.id);
    const groupLoans = loans.filter((l: any) => {
      const loanMember = members.find((m: any) => m.id === l.memberId);
      return loanMember && loanMember.groupId === group.id;
    });

    const totalLoanAmount = groupLoans.reduce(
      (sum, l: any) => sum + parseFloat(l.principleAmount || 0),
      0
    );
    const outstandingBalance = groupLoans.reduce(
      (sum, l: any) => sum + parseFloat(l.outstandingBalance || 0),
      0
    );

    return {
      "Group ID": group.id,
      "Group Name": group.name,
      "Branch ID": group.branchId,
      "Loan Officer ID": group.loanOfficerId,
      "Total Members": groupMembers.length,
      "Max Members": group.maxMembers,
      "Active Members": groupMembers.filter((m: any) => m.status === "active")
        .length,
      "Total Loans": groupLoans.length,
      "Total Loan Amount": `KES ${totalLoanAmount.toLocaleString()}`,
      "Outstanding Balance": `KES ${outstandingBalance.toLocaleString()}`,
      Status: group.isActive ? "Active" : "Inactive",
      "Created Date": new Date(group.createdAt).toLocaleDateString(),
    };
  });
};

export const generateGroupMembersReport = (
  groupId: number,
  groupName: string,
  members: any[],
  loans: any[]
): any[] => {
  const groupMembers = members.filter((m: any) => m.groupId === groupId);

  return groupMembers.map((member) => {
    const memberLoans = loans.filter((l: any) => l.memberId === member.id);
    const totalLoaned = memberLoans.reduce(
      (sum, l: any) => sum + parseFloat(l.principleAmount || 0),
      0
    );
    const outstanding = memberLoans.reduce(
      (sum, l: any) => sum + parseFloat(l.outstandingBalance || 0),
      0
    );

    return {
      "Member Code": member.memberCode,
      Status: member.status,
      "Risk Score": member.riskScore,
      "Risk Category": member.riskCategory,
      "Total Loans": memberLoans.length,
      "Total Loaned": `KES ${totalLoaned.toLocaleString()}`,
      "Outstanding": `KES ${outstanding.toLocaleString()}`,
      "Created Date": new Date(member.createdAt).toLocaleDateString(),
    };
  });
};

export const generateLoansReport = (loans: any[]): any[] => {
  return loans.map((loan) => ({
    "Loan Number": loan.loanNumber,
    "Principal Amount": `KES ${parseFloat(loan.principleAmount).toLocaleString()}`,
    "Total Amount": `KES ${parseFloat(loan.totalAmount).toLocaleString()}`,
    "Outstanding Balance": `KES ${parseFloat(loan.outstandingBalance).toLocaleString()}`,
    Status: loan.status,
    "Application Date": new Date(loan.applicationDate).toLocaleDateString(),
    "Due Date": loan.dueDate
      ? new Date(loan.dueDate).toLocaleDateString()
      : "N/A",
  }));
};
