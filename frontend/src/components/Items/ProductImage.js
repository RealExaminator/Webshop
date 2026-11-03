import React from 'react';
import { itemImage } from '../../utils/helpers';

const ProductImage = ({ item, sold = false, thumb = false }) => {
  const title = item?.title || 'Item';
  return (
    <div className={`item-photo${thumb ? ' item-photo--thumb' : ''}`}>
      <img src={itemImage(item)} alt={thumb ? '' : title} />
      {sold && <span className="item-badge">(Sold)</span>}
    </div>
  );
};

export default ProductImage;
