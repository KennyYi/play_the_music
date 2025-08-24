import { Select, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import React from "react";

const SelectPage: React.FC = () => {
  return (
    <div className="p-6 items-center justify-center flex flex-col">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a music genre" />
        </SelectTrigger>
      </Select>
    </div>
  );
};

export default SelectPage;
