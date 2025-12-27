import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HardLockOverlay from '@/features/provider/subscription/components/HardLockOverlay';
import ServiceListWithLimits from '@/features/provider/subscription/components/ServiceListWithLimits';
import PhotoUploadWithLimits from '@/features/provider/subscription/components/PhotoUploadWithLimits';

describe('HardLockOverlay Component', () => {
  it('should render overlay with correct hidden count', () => {
    render(
      <HardLockOverlay
        itemType="service"
        hiddenCount={3}
        planName="PRO"
        onUpgrade={vi.fn()}
      />
    );

    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('should render lock icon', () => {
    render(
      <HardLockOverlay
        itemType="service"
        hiddenCount={2}
        onUpgrade={vi.fn()}
      />
    );

    const lockIcon = screen.getByRole('img', { hidden: true });
    expect(lockIcon).toHaveClass('lock');
  });

  it('should call onUpgrade when button clicked', () => {
    const mockUpgrade = vi.fn();

    render(
      <HardLockOverlay
        itemType="photo"
        hiddenCount={5}
        onUpgrade={mockUpgrade}
      />
    );

    const upgradeButton = screen.getByRole('button', { name: /upgrade/i });
    fireEvent.click(upgradeButton);

    expect(mockUpgrade).toHaveBeenCalled();
  });

  it('should apply correct styling for different item types', () => {
    const { rerender } = render(
      <HardLockOverlay itemType="service" hiddenCount={1} onUpgrade={vi.fn()} />
    );

    expect(screen.getByText(/1 usługa/)).toBeInTheDocument();

    rerender(
      <HardLockOverlay itemType="photo" hiddenCount={2} onUpgrade={vi.fn()} />
    );

    expect(screen.getByText(/2 zdjęcia/)).toBeInTheDocument();
  });
});

describe('ServiceListWithLimits Component', () => {
  const mockServices = [
    { id: 1, name: 'Naprawa lodówki', description: 'Serwis RTV' },
    { id: 2, name: 'Czyszczenie', description: 'Sprzątanie' },
    { id: 3, name: 'Hydraulika', description: 'Usługi hydrauliczne' },
    { id: 4, name: 'Elektryka', description: 'Serwis elektro' },
    { id: 5, name: 'Glazura', description: 'Prace glazurnicze' },
  ];

  const mockLimits = {
    max_services: 3,
    max_photos_per_service: 5,
    max_portfolio_photos: 20,
  };

  it('should render only visible services up to limit', () => {
    render(
      <ServiceListWithLimits
        services={mockServices}
        limits={mockLimits}
        onAddService={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    // Powinno być 3 usługi widoczne
    expect(screen.getByText('Naprawa lodówki')).toBeInTheDocument();
    expect(screen.getByText('Czyszczenie')).toBeInTheDocument();
    expect(screen.getByText('Hydraulika')).toBeInTheDocument();

    // Reszta ukryta
    expect(screen.queryByText('Elektryka')).not.toBeInTheDocument();
    expect(screen.queryByText('Glazura')).not.toBeInTheDocument();
  });

  it('should display limit counter', () => {
    render(
      <ServiceListWithLimits
        services={mockServices}
        limits={mockLimits}
        onAddService={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    expect(screen.getByText(/3 \/ 3/)).toBeInTheDocument();
  });

  it('should disable Add button when at limit', () => {
    const mockAdd = vi.fn();

    render(
      <ServiceListWithLimits
        services={mockServices}
        limits={mockLimits}
        onAddService={mockAdd}
        onUpgrade={vi.fn()}
      />
    );

    const addButton = screen.getByRole('button', { name: /add/i });
    expect(addButton).toBeDisabled();
  });

  it('should enable Add button when under limit', () => {
    const fewerServices = mockServices.slice(0, 2);

    render(
      <ServiceListWithLimits
        services={fewerServices}
        limits={mockLimits}
        onAddService={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    const addButton = screen.getByRole('button', { name: /add/i });
    expect(addButton).not.toBeDisabled();
  });

  it('should show warning at 80% capacity', () => {
    const almostFullServices = mockServices.slice(0, 3); // 3/3 = 100%

    render(
      <ServiceListWithLimits
        services={almostFullServices}
        limits={mockLimits}
        onAddService={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    expect(screen.getByText(/limit/i)).toBeInTheDocument();
  });

  it('should render overlay for hidden services', () => {
    render(
      <ServiceListWithLimits
        services={mockServices}
        limits={mockLimits}
        onAddService={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    // +2 hidden services badge
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should call onAddService when button clicked', () => {
    const mockAdd = vi.fn();
    const fewerServices = mockServices.slice(0, 2);

    render(
      <ServiceListWithLimits
        services={fewerServices}
        limits={mockLimits}
        onAddService={mockAdd}
        onUpgrade={vi.fn()}
      />
    );

    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    expect(mockAdd).toHaveBeenCalled();
  });

  it('should call onUpgrade when clicking upgrade CTA on overlay', () => {
    const mockUpgrade = vi.fn();

    render(
      <ServiceListWithLimits
        services={mockServices}
        limits={mockLimits}
        onAddService={vi.fn()}
        onUpgrade={mockUpgrade}
      />
    );

    const upgradeButton = screen.getByRole('button', { name: /upgrade/i });
    fireEvent.click(upgradeButton);

    expect(mockUpgrade).toHaveBeenCalled();
  });
});

describe('PhotoUploadWithLimits Component', () => {
  const mockLimits = {
    max_services: 10,
    max_photos_per_service: 5,
    max_portfolio_photos: 20,
  };

  const mockPhotos = [
    { id: 1, url: '/photo1.jpg', name: 'photo1.jpg' },
    { id: 2, url: '/photo2.jpg', name: 'photo2.jpg' },
    { id: 3, url: '/photo3.jpg', name: 'photo3.jpg' },
  ];

  it('should render photo grid with visible photos', () => {
    render(
      <PhotoUploadWithLimits
        photos={mockPhotos}
        limits={mockLimits}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    // All 3 photos should be visible (under limit of 5)
    expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(3);
  });

  it('should display upload progress', () => {
    render(
      <PhotoUploadWithLimits
        photos={mockPhotos}
        limits={mockLimits}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    expect(screen.getByText(/3 \/ 5/)).toBeInTheDocument();
  });

  it('should enable upload when under limit', () => {
    render(
      <PhotoUploadWithLimits
        photos={mockPhotos}
        limits={mockLimits}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    const uploadInput = screen.getByRole('button', { name: /upload/i });
    expect(uploadInput).not.toBeDisabled();
  });

  it('should disable upload when at limit', () => {
    const fullPhotos = mockPhotos.concat([
      { id: 4, url: '/photo4.jpg', name: 'photo4.jpg' },
      { id: 5, url: '/photo5.jpg', name: 'photo5.jpg' },
    ]);

    render(
      <PhotoUploadWithLimits
        photos={fullPhotos}
        limits={mockLimits}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    const uploadInput = screen.getByRole('button', { name: /upload/i });
    expect(uploadInput).toBeDisabled();
  });

  it('should show hidden photos with overlay', () => {
    const manyPhotos = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      url: `/photo${i + 1}.jpg`,
      name: `photo${i + 1}.jpg`,
    }));

    render(
      <PhotoUploadWithLimits
        photos={manyPhotos}
        limits={mockLimits}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    // +2 hidden photos badge
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should call onDelete when clicking delete button', () => {
    const mockDelete = vi.fn();

    render(
      <PhotoUploadWithLimits
        photos={mockPhotos}
        limits={mockLimits}
        onUpload={vi.fn()}
        onDelete={mockDelete}
        onUpgrade={vi.fn()}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete|remove/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockDelete).toHaveBeenCalledWith(mockPhotos[0]);
  });

  it('should handle file drag and drop', () => {
    const mockUpload = vi.fn();

    render(
      <PhotoUploadWithLimits
        photos={mockPhotos}
        limits={mockLimits}
        onUpload={mockUpload}
        onDelete={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    const dropZone = screen.getByText(/drag/i).closest('[role="button"]');
    const files = [new File(['content'], 'test.jpg', { type: 'image/jpeg' })];

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files,
      },
    });

    expect(mockUpload).toHaveBeenCalled();
  });

  it('should accept only image files', () => {
    const mockUpload = vi.fn();

    render(
      <PhotoUploadWithLimits
        photos={mockPhotos}
        limits={mockLimits}
        onUpload={mockUpload}
        onDelete={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    const input = screen.getByRole('button', { hidden: true }) as HTMLInputElement;

    // Verify accept attribute
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('should show upgrade CTA when photos hidden', () => {
    const manyPhotos = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      url: `/photo${i + 1}.jpg`,
      name: `photo${i + 1}.jpg`,
    }));

    const mockUpgrade = vi.fn();

    render(
      <PhotoUploadWithLimits
        photos={manyPhotos}
        limits={mockLimits}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onUpgrade={mockUpgrade}
      />
    );

    const upgradeButton = screen.getByRole('button', { name: /upgrade/i });
    expect(upgradeButton).toBeInTheDocument();

    fireEvent.click(upgradeButton);
    expect(mockUpgrade).toHaveBeenCalled();
  });

  it('should update color based on capacity', () => {
    const { rerender } = render(
      <PhotoUploadWithLimits
        photos={mockPhotos}
        limits={mockLimits}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    // 3/5 = 60% (green)
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-green');

    // 5/5 = 100% (red)
    const fullPhotos = mockPhotos.concat([
      { id: 4, url: '/photo4.jpg', name: 'photo4.jpg' },
      { id: 5, url: '/photo5.jpg', name: 'photo5.jpg' },
    ]);

    rerender(
      <PhotoUploadWithLimits
        photos={fullPhotos}
        limits={mockLimits}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-red');
  });
});
