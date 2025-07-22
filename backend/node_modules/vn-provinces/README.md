## Nguồn data vn-provinces

https://www.gso.gov.vn/phuong-phap-thong-ke/danh-muc/don-vi-hanh-chinh/

## Description

A simple and easy-to-use npm package that provides a complete list of provinces and cities in Vietnam, including their names, codes, and geographical information.

## Install

```
$ npm i vn-provinces
$ yarn add vn-provinces

```

## Functions

| Function                                                 | Desciption                             |
| -------------------------------------------------------- | -------------------------------------- |
| getProvinces()                                           | Lấy danh sách các tỉnh/thành phố       |
| getProvinceByCode()                                      | Lấy thông tin tỉnh/thành phố           |
| getDistricts()                                           | Lấy danh sách các huyện/quận           |
| getDistrictByCode()                                      | Lấy thông tin huyện/quận               |
| getWards()                                               | Lấy danh sách các xã/phường            |
| getWardByCode()                                          | Lấy thông tin xã/phường                |
| getDistrictsByProvinceCode(provinceCode)                 | Lấy danh sách huyện/ quận theo mã tỉnh |
| getWardsByDistrictCode(districtCode)                     | Lấy danh sách phường/ xã theo mã huyện |
| searchAndPaginateDistricts(searchString, page, pageSize) | Lấy danh sách theo page                |
| searchAndPaginateProvinces(searchString, page, pageSize) | Lấy danh sách theo page                |
| searchAndPaginateWards(searchString, page, pageSize)     | Lấy danh sách theo page                |

## Examples

- [getProvinces](#getProvinces)
- [getProvinceByCode](#getProvinceByCode)
- [getDistricts](#getDistricts)
- [getDistrictByCode](#getDistrictByCode)
- [getWards](#getWards)
- [getWardByCode](#getWardByCode)

### Usage

#### getProvinces

```
import {getProvinces} from "vn-provinces";

 console.log(getProvinces());
 [
    {
    code: '01',
    name: 'Thành phố Hà Nội',
    slug: 'thanh-pho-ha-noi',
    unit: 'Thành phố Trung ương'
  },
  {
    code: '02',
    name: 'Tỉnh Hà Giang',
    slug: 'tinh-ha-giang',
    unit: 'Tỉnh'
  },... more item
 ]

```

#### getProvinceByCode

```
import {getProvinceByCode} from "vn-provinces";

 console.log(getProvinceByCode('01'));
 {
  code: '01',
  name: 'Thành phố Hà Nội',
  slug: 'thanh-pho-ha-noi',
  unit: 'Thành phố Trung ương'
}

```

#### getDistricts

```
import {getDistricts} from "vn-provinces";

 console.log(getDistricts());

 [
  {
    code: '118',
    name: 'Huyện Quỳnh Nhai',
    slug: 'huyen-quynh-nhai',
    unit: 'Huyện',
    provinceCode: '14',
    provinceName: 'Tỉnh Sơn La',
    fullName: 'Huyện Quỳnh Nhai, Tỉnh Sơn La'
  },
  {
    code: '119',
    name: 'Huyện Thuận Châu',
    slug: 'huyen-thuan-chau',
    unit: 'Huyện',
    provinceCode: '14',
    provinceName: 'Tỉnh Sơn La',
    fullName: 'Huyện Thuận Châu, Tỉnh Sơn La'
  },
  {
    code: '120',
    name: 'Huyện Mường La',
    slug: 'huyen-muong-la',
    unit: 'Huyện',
    provinceCode: '14',
    provinceName: 'Tỉnh Sơn La',
    fullName: 'Huyện Mường La, Tỉnh Sơn La'
  },... more item
 ]

```

#### getDistrictByCode

```
import {getDistrictByCode} from "vn-provinces";

 console.log(getDistrictByCode('120'));
 {
    code: '120',
    name: 'Huyện Mường La',
    slug: 'huyen-muong-la',
    unit: 'Huyện',
    provinceCode: '14',
    provinceName: 'Tỉnh Sơn La',
    fullName: 'Huyện Mường La, Tỉnh Sơn La'
 }

```

#### getWards

```
import {getWards} from "vn-provinces";

 console.log(getWards());

 [
  {
    code: '00289',
    name: 'Phường Quỳnh Mai',
    slug: 'phuong-quynh-mai',
    unit: 'Phường',
    districtCode: '007',
    districtName: 'Quận Hai Bà Trưng',
    provinceCode: '01',
    provinceName: 'Thành phố Hà Nội',
    fullName: 'Phường Quỳnh Mai, Quận Hai Bà Trưng, Thành phố Hà Nội'
  },
  {
    code: '00292',
    name: 'Phường Quỳnh Lôi',
    slug: 'phuong-quynh-loi',
    unit: 'Phường',
    districtCode: '007',
    districtName: 'Quận Hai Bà Trưng',
    provinceCode: '01',
    provinceName: 'Thành phố Hà Nội',
    fullName: 'Phường Quỳnh Lôi, Quận Hai Bà Trưng, Thành phố Hà Nội'
  },... more item
 ]

```

#### getWardByCode

```
import {getWardByCode} from "vn-provinces";

 console.log(getWardByCode('00292'));
 {
    code: '00292',
    name: 'Phường Quỳnh Lôi',
    slug: 'phuong-quynh-loi',
    unit: 'Phường',
    districtCode: '007',
    districtName: 'Quận Hai Bà Trưng',
    provinceCode: '01',
    provinceName: 'Thành phố Hà Nội',
    fullName: 'Phường Quỳnh Lôi, Quận Hai Bà Trưng, Thành phố Hà Nội'
 }

```
