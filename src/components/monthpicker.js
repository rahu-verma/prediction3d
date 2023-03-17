import React, { useState } from 'react';
import DatePicker from 'react-date-picker';

function MonthPicker() {
  const [value, onChange] = useState(new Date());

  return (
    <p>
      <DatePicker onChange={onChange} format={'y-MM-dd'} name="hm_date[]" value={value} />
    </p>
  );
}

export default MonthPicker;
